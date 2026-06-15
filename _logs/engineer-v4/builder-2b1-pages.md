# Builder 2b1 - Pages & Routing Summary

## Status: COMPLETE

## Files Created (12)

### Layout
- `src/layouts/AppLayout.tsx` - Fixed left sidebar (256px) with nav links, top bar with search/notifications/avatar, Outlet for child routes

### Pages
1. `src/pages/Dashboard.tsx` - Route: `/` - Overview cards, weather widget, crew schedule timeline (Recharts BarChart), activity feed, quick actions
2. `src/pages/Customers.tsx` - Route: `/customers` - Search/filter bar, 12 customer cards with status badges, links to detail
3. `src/pages/CustomerDetail.tsx` - Route: `/customers/:id` - Full customer profile with property details, active services, service history timeline, communication log, notes
4. `src/pages/Schedule.tsx` - Route: `/schedule` - Week view calendar with crew filter sidebar, weather overlay, color-coded job blocks by service type, time grid
5. `src/pages/Crews.tsx` - Route: `/crews` - 6 crew cards with members, specialties, equipment, performance metrics (jobs/day, efficiency %)
6. `src/pages/FieldOps.tsx` - Route: `/field` - Mobile-style view with clock in/out, break timer, GPS indicator, 5 job cards with Start/Complete buttons
7. `src/pages/Weather.tsx` - Route: `/weather` - Current conditions, 7-day forecast with impact indicators, active alerts, affected jobs table with auto-reschedule suggestions, rain history
8. `src/pages/Reports.tsx` - Route: `/reports` - Revenue line chart (30 days), jobs bar chart (weekly), crew performance table, retention metrics, route efficiency stats
9. `src/pages/Communications.tsx` - Route: `/communications` - Tabbed interface (Recent/Templates/Scheduled/Windows), message templates, notification status tracking, committed windows
10. `src/pages/Settings.tsx` - Route: `/settings` - Tabbed sidebar (Company/Services/Weather/Notifications/Hours), toggleable service types with pricing, weather threshold config, working hours

### Router
- `src/App.tsx` - Updated with all routes wrapped in AppLayout using HashRouter

## Design System Compliance
- All pages use `bg-white`, `text-slate-900`, `rounded-xl`, `shadow-card`, `border-slate-100`
- Primary color (#6366F1) used for active states, buttons, accents
- Accent-light (#E0E7FF) used for active nav links
- Status colors: success (#22C55E), warning (#F59E0B), error (#EF4444)
- Lucide React icons used throughout
- Inter font with -0.01em letter spacing (via CSS)
- NO dark mode styles

## Validation
- `npx tsc --noEmit` passes with 0 errors
- All imports resolve correctly
- All routes configured with HashRouter
- All links use `<Link to="...">` (no href)

## Mock Data
- 12 customers with realistic Orlando, FL addresses
- 6 crews with members, equipment, specialties
- 7-day weather forecast with rain impact
- 30-day revenue data, weekly job data
- 8 affected jobs with reschedule suggestions
- 6 message templates, 8 recent notifications
- Service types with pricing
