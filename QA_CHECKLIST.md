# Final requirement check — 13 November 2026

| Requirement | Result | Evidence |
| --- | --- | --- |
| Full inventory without filters | PASS | Backend and live React tests return/render all 40 products |
| One and multiple categories | PASS | Live checks: Electronics 8; Electronics + Footwear 16 |
| Inclusive min/max prices | PASS | Exact-boundary backend tests at 149, 699, 4999, 14999; live UI tests move both bounds |
| Ratings 1–5 | PASS | Live tests click every rating and compare with FastAPI |
| All three filters intersect | PASS | Backend combination matrix and live requests |
| Price ascending, top rated first | PASS | Backend oracle and live rendered order checks |
| Filter before sort; source unchanged | PASS | Service inspection, combination tests and immutability test |
| Input validation and CORS | PASS | Invalid category/numbers/range/sort rejected; origin tests |
| Instant requests, no Submit button | PASS | React interaction tests use real HTTP; no client filtering/sorting |
| Stale response handling | PASS | Automated delayed-response test, cancellation plus active-request guard |
| Product names, images, prices, ratings | PASS with limit | DOM assertions; all 40 image URLs return HTTP 200 after fixing one broken URL; visible desktop images rendered in browser |
| No matches and Reset Filters | PASS | Empty grid replaced by required message; reset returns all 40 |
| Loading, API error and retry | PASS | Frontend tests include offline, HTTP 422 and HTTP 500; errors no longer claim zero matches |
| Reusable frontend/backend architecture | PASS | Components, hook, API helper, schemas and filtering service |
| Production build and same-origin hosting | PASS | Vite build; FastAPI serves HTML and API; five live integration tests |
| Sticky sidebar and desktop layout | PASS | Live browser visual inspection; computed sidebar position is sticky; no desktop horizontal overflow |
| Mobile visual layout | NOT VERIFIED | Responsive CSS implemented; browser viewport resizing is unavailable |
| Pointer dragging of both slider thumbs | PASS | Live browser pointer drags changed min to 3304 and max to 11767, with results updating |
| Public live website | PASS | https://quantiphi-vibecoding.vercel.app/; deployed to Suhaib Vercel workspace; 12 unauthenticated API checks passed |
| Public GitHub and incremental commits | PASS | Existing public repository, meaningful staged commits |
| Docker image build | NOT VERIFIED | Docker unavailable; equivalent build/server tested directly |
| Unstop submission and proctoring | USER ACTION | Repository link submission, full-screen sharing, camera/mic and assessment conduct cannot be verified by application tests |

Test totals: **171 backend**, **9 frontend component**, **5 live integration** tests passed. Frontend production build passed. One upstream Starlette/AnyIO deprecation warning remains; it does not fail tests.

The live integration suite uses jsdom plus real HTTP. It verifies React interactions through the network, not browser layout or pointer gestures. Separate actual browser checks are now recorded below.

The materials contain a 12:00 PM submission line conflicting with the 1:00–2:30 PM round. Work in this session follows the later round announcement's 2:30 PM IST end time; final cutoff and submission remain the candidate's responsibility. No repository modifications should be made after the applicable cutoff.

## Live production browser verification

- URL: https://quantiphi-vibecoding.vercel.app/
- Vercel reported Deployed to Production for source commit c6aa117.
- Full inventory rendered 40 products.
- Electronics + Footwear + minimum rating 4 rendered 13 products; price ascending and top-rated ordering were inspected.
- Apparel + minimum rating 5 rendered the required no-match message with zero cards; Reset Filters restored 40.
- Keyboard changes to min 150 / max 14998 rendered 38; Reset all restored 40.
- Actual pointer drags moved both price thumbs and changed results.
- Desktop screenshot saved at docs/screenshots/catalog-desktop.jpg.
- Mobile visual behavior and real-browser forced API outages were not tested; mobile toggle and API outage/retry remain covered by automated component tests.
