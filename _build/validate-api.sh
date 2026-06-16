#!/usr/bin/env bash
# Smoke test for the Orange Blossom API. Run from repo root.
set -u
API=http://localhost:4000
J() { python3 -c "import json,sys;d=json.load(sys.stdin);print($1)"; }

for i in $(seq 1 20); do curl -sf $API/api/health >/dev/null 2>&1 && break; sleep 1; done

echo "=== HEALTH ==="; curl -s $API/api/health; echo

echo "=== LOGIN (owner) ==="
curl -s -X POST $API/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"owner@orangeblossom.com","password":"Password123!"}' > /tmp/login.json
TOKEN=$(J 'd["token"]' < /tmp/login.json)
echo "user: $(J 'd["user"]["name"]+" / "+d["user"]["role"]' < /tmp/login.json)"
echo "token length: ${#TOKEN}"

AUTH="Authorization: Bearer $TOKEN"

echo "=== WRONG PASSWORD (expect 401) ==="
curl -s -o /dev/null -w "%{http_code}\n" -X POST $API/api/auth/login \
  -H 'Content-Type: application/json' -d '{"email":"owner@orangeblossom.com","password":"wrong"}'

echo "=== ME ==="; curl -s $API/api/auth/me -H "$AUTH" | J 'd["user"]["email"]'

echo "=== AUTH GUARD no token (expect 401) ==="
curl -s -o /dev/null -w "%{http_code}\n" $API/api/customers

echo "=== CUSTOMERS ==="
curl -s $API/api/customers -H "$AUTH" | J 'str(len(d))+" customers; first="+d[0]["name"]+" props="+str(len(d[0]["properties"]))+" svcs="+str(len(d[0]["properties"][0]["services"]))'

echo "=== CREATE CUSTOMER (persist test) ==="
curl -s -X POST $API/api/customers -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"name":"E2E Test Customer","email":"e2e@test.com","phone":"330-555-9999","address":"1 Test St","city":"Akron","state":"OH","zip":"44301","status":"active"}' \
  | J 'd["id"]' > /tmp/newcust.txt
NEWID=$(cat /tmp/newcust.txt)
echo "created id=$NEWID"
echo "count after create:"; curl -s $API/api/customers -H "$AUTH" | J 'len(d)'
echo "=== DELETE that customer (cleanup) ==="
curl -s -X DELETE $API/api/customers/$NEWID -H "$AUTH"; echo
echo "count after delete:"; curl -s $API/api/customers -H "$AUTH" | J 'len(d)'

echo "=== DASHBOARD STATS ==="; curl -s $API/api/dashboard/stats -H "$AUTH"; echo
echo "=== JOBS TODAY ==="; curl -s $API/api/jobs/today -H "$AUTH" | J 'str(len(d))+" jobs"'
echo "=== CREWS ==="; curl -s $API/api/crews -H "$AUTH" | J 'str(len(d))+" crews; "+d[0]["name"]+" members="+str(len(d[0]["members"]))'
echo "=== WEATHER ==="; curl -s $API/api/weather -H "$AUTH" | J '"temp="+str(d["current"]["temp"])+" forecast="+str(len(d["forecast"]))'
echo "=== METRICS ==="; curl -s "$API/api/reports/daily-metrics?days=30" -H "$AUTH" | J 'str(len(d))+" days; revenue="+str(sum(m["revenue"] for m in d))'
echo "=== METRICS STABLE (2nd call identical?) ==="
A=$(curl -s "$API/api/reports/daily-metrics?days=30" -H "$AUTH" | J 'sum(m["revenue"] for m in d)')
B=$(curl -s "$API/api/reports/daily-metrics?days=30" -H "$AUTH" | J 'sum(m["revenue"] for m in d)')
echo "call1=$A call2=$B -> $([ "$A" = "$B" ] && echo STABLE || echo DRIFT)"
echo "=== DONE ==="
