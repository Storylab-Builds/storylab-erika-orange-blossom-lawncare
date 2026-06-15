# Debugger Output - Lawn Care Field Service Platform

## Build Status

- **Vite Build**: PASS (no errors, 1 chunk-size warning which is expected)
- **TypeScript**: PASS (zero errors with `tsc --noEmit`)

---

## Bugs Found and Fixed

### Bug 1: Global CSS Transition on All Elements (Performance/Visual)

- **Classification**: Configuration
- **Confidence**: 95
- **File**: `src/index.css` (lines 49-62)
- **Symptom**: The wildcard selector `*, *::before, *::after` applied `transition-property: color, background-color, border-color, box-shadow` to every single DOM element. This fights with Tailwind's `transition-*` utility classes and causes:
  1. Every element on the page transitions colors on mount/re-render (flash effects)
  2. Conflict with Tailwind's own `transition-colors`, `transition-all` classes already used throughout components
  3. The override block `[class*="animate-"], [class*="transition-"]` then re-applied `transition-property: all` which is overly broad and can make layout/transform properties transition unexpectedly
  4. Performance cost: the browser must evaluate transition metadata for thousands of elements
- **Fix**: Scoped transitions to only interactive elements (`button`, `a`, `input`, `select`, `textarea`, `[role="button"]`). Removed the conflicting override block entirely.

### Bug 2: Schedule Page Week Navigation Buttons Non-Functional

- **Classification**: Logic
- **Confidence**: 100
- **File**: `src/pages/Schedule.tsx` (lines 114, 133-140)
- **Symptom**: The ChevronLeft and ChevronRight buttons for navigating between weeks were rendered but had no `onClick` handlers. The `weekStart` state was destructured as `const [weekStart] = useState(...)` -- the setter was omitted, making it impossible to change the week.
- **Root Cause**: The `useState` setter was not destructured, and the buttons had no click handlers wired up.
- **Fix**:
  1. Changed destructuring to `const [weekStart, setWeekStart] = useState(...)`
  2. Added `subDays` to the date-fns import
  3. Wired `onClick` on the left button to `setWeekStart((prev) => subDays(prev, 7))`
  4. Wired `onClick` on the right button to `setWeekStart((prev) => addDays(prev, 7))`

---

## Issues Identified (Not Fixed - Design Decisions)

### Issue 3: Customer Data Inconsistency Between Pages

- **Classification**: Data
- **Pages**: `Customers.tsx` vs `CustomerDetail.tsx` vs `data/mockData.ts`
- **Detail**: Three separate customer datasets exist:
  1. `data/mockData.ts` - 15 customers in Northeast Ohio (Akron, Canton, Medina, etc.)
  2. `pages/Customers.tsx` - 12 customers in Orlando, FL (inline local data)
  3. `pages/CustomerDetail.tsx` - 1 detailed customer in Orlando, FL (inline local data)
- The Customers list page links to `/customers/:id` with IDs 1-12, but CustomerDetail only has detail data for ID "1". All other IDs fall back to the ID-1 data with the name overridden to "Customer #N". This means clicking any customer card shows mostly wrong detail data.
- **Why not fixed**: This appears to be a deliberate simplification for the mock/demo stage. The proper fix would involve either: (a) wiring up both pages to use the shared `data/mockData.ts` customers and the `useCustomer` hook, or (b) creating detailed mock data for all 12 Orlando customers. Both are feature work rather than bug fixes.

### Issue 4: Dashboard Hardcoded Data Inconsistent with Mock Data

- **Classification**: Data
- **Page**: `Dashboard.tsx`
- **Detail**: Dashboard uses entirely hardcoded inline data (6 crews, "Orlando FL" weather, 82F) that doesn't match the mock data module (3 crews in NE Ohio, 78F cloudy). The dashboard shows "Crews Active: 6" while the Crews page shows 6 crews (matching its own inline data), but the shared mockData only defines 3 crews.
- **Why not fixed**: Same rationale -- the pages use self-contained inline data as a demo approach. Wiring everything to the shared data layer is feature work.

---

## Verification

- [x] Original bugs fixed (CSS transitions scoped, schedule navigation functional)
- [x] Vite build passes with zero errors
- [x] TypeScript type-check passes with zero errors
- [x] No regressions introduced (all existing pages render same structure)

---

## Files Modified

1. `src/index.css` - Scoped global transitions to interactive elements only
2. `src/pages/Schedule.tsx` - Added week navigation functionality (import, state setter, onClick handlers)
