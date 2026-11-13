# Stage-one verification — 13 November 2026

- Installed Python runtime/test dependencies in `backend/.venv` and frontend dependencies with npm.
- Backend: `python -m pytest -q` — **166 passed**. One third-party Starlette/AnyIO deprecation warning; no test failures.
- Frontend: `npm run build` — passed.
- Started Uvicorn and Vite and checked actual HTTP responses in the same execution environment:
  - `/api/health`: 200, status ok.
  - `/api/catalog`: 200, five categories, price range INR 149–14999.
  - `/api/products`: 200, 40 products.
  - Multiple categories + price + minimum rating + ascending price sort: 200, 9 products.
  - `/api/products?min_price=20000`: 200, zero products.
  - Vite `/api/products` proxy: 200, 40 products.
  - Vite root HTML: 200, React mount element present.
- Fixed Vite startup failure from restricted network-interface enumeration by binding explicitly to 127.0.0.1.
- Cloud browser navigation to the workspace localhost returned `ERR_CONNECTION_REFUSED`. The browser cannot reach the executor's loopback server. React rendering, external image loading and actual browser interactions are **not verified**.
- Sidebar controls, sorting menu and reset UI are not implemented in this stage; only their server behavior is tested. See README for remaining work.

`frontend/package-lock.json` locks npm dependencies. `backend/requirements-lock.txt` records the tested Python environment; install it with `python -m pip install -r requirements-lock.txt` for identical versions.

## Catalog UI stage

- Added reusable React components and Tailwind responsive styling.
- Added a genuine Radix two-thumb slider with keyboard and pointer support, native checkbox/radio/select controls and mobile filter expansion.
- Implemented immediate server requests, cancellation and stale-response protection, loading/error/retry, empty state and complete reset.
- `npm test`: **7 passed** (jsdom component integration tests with mocked API responses).
- `npm run build`: passed.
- The first slider test dispatched a key event without focusing the second thumb. Updated the test to focus each thumb, matching actual keyboard use; both bounds now pass.
- No backend business logic was moved to the frontend.
- Cloud browser access remains unavailable for workspace localhost. Visual desktop/mobile layout, pointer dragging and external image loading have not been browser-verified.

## Live integration stage

- Started both apps together, with Vite forwarding `/api` requests to the running FastAPI service.
- `npm run test:integration`: **5 passed**, exercising actual HTTP responses rather than fixtures.
- Confirmed initial 40 products; Electronics returns 8; Electronics + Footwear returns 16; clearing both returns 40.
- Confirmed minimum ratings 1–5 and clearing the rating, comparing rendered names and count with actual backend responses.
- Confirmed category + rating intersections with price ascending and rating descending sorting, preserving server product order in React.
- Confirmed lower price 150 and upper price 14998 produce 38 products; Reset all restores 40 and removes query restrictions.
- Confirmed Apparel + minimum rating 5 produces the required empty state; Reset Filters clears categories, price, rating and sorting and restores all 40 products.
- Rechecked `python -m pytest -q`: **166 passed** (one upstream deprecation warning).
- Rechecked `npm test`: **7 passed**, including simulated stale responses, errors/retry and reset controls.
- Rechecked `npm run build`: passed.
- Initial live harness failures came from jsdom AbortSignal incompatibility with Node fetch and an incorrect Radix End-key assumption. Corrected the test harness and scenario; no application-code fixes were needed.
- Real-browser visual layout, pointer dragging and external image loading remain unverified. Live HTTP integration and jsdom interaction tests do not remove that limitation.

## Final QA

- Backend: 171 passed, including exact-price boundaries and production HTML/API cohosting.
- Frontend: 9 passed, including HTTP 422/500 errors and retry. Fixed misleading zero-result count on API failure.
- Live integration: 5 passed against FastAPI's production same-origin setup on port 8000.
- Frontend production build passed.
- Checked all 40 image URLs with HTTP HEAD: 39 returned 200, one camping image returned 404. Replaced that URL with a verified HTTP 200 image. This checks URL availability, not visual rendering.
- Added production static asset serving and a Dockerfile. Docker is unavailable, so the image build is unverified; direct production execution passed.
- Deployment is blocked pending the intended hosting account. The user declined the available Render workspace; Vercel returns no available teams. No working public URL has been claimed.
- See QA_CHECKLIST.md for requirement-level PASS / NOT VERIFIED / BLOCKED status.

## Final submission preparation

- Rewrote README with overview, stack, requirements, platform-specific installation and startup commands, API examples, filter semantics, architecture, tests, hosting and a Viva explanation.
- Verified ignore rules for node_modules, .venv, .env files, dist, .vercel and generated reports; audited tracked paths for those unwanted files.
- Added Vercel Services configuration for Vite + FastAPI and Python 3.12 selection. Services is a Beta platform feature. Configuration validates against the fetched official schema using Draft7Validator; no remote build or deployment has been verified.
- Final rerun: 171 backend tests, 9 frontend tests, 5 live HTTP integration tests and production build passed.
- GitHub connected account has push/admin access and the repository is public. Existing meaningful commits were inspected.
- Initial browser check showed the login page. A fresh tab subsequently verified the signed-in Suhaib dashboard at suhaibiqbal961-9497s-projects. No live deployment is claimed.
- Final preparation is committed locally; the final push awaits the user's requested approval. Existing published code remains at eb22da4 until that approval is given and the push is verified.
- No screenshots were added because no browser rendering screenshots were verified. No Unstop submission was performed.

## Live deployment and browser completion

- User approved publishing and deployment. Final submission configuration was pushed as c6aa117.
- Vercel API lacked the selected team's grant; deployed using the user's signed-in Suhaib browser workspace.
- After the GitHub permission page closed, Vercel's refreshed import list showed Quantiphi.vibecoding. Imported the existing repository; no duplicate source repository was created.
- Vercel detected Vite + FastAPI Services and reported Deployed to Production.
- Verified public URL: https://quantiphi-vibecoding.vercel.app/
- Twelve unauthenticated production API smoke checks passed.
- Live browser checks passed for initial 40 products, combined filters, ascending price and descending rating order, zero-results screen, reset, keyboard changes to both price bounds and actual pointer drags of both thumbs.
- Verified desktop appearance, sticky sidebar and visible product thumbnails. Captured docs/screenshots/catalog-desktop.jpg.
- Mobile visual checks remain unverified; browser viewport resizing was unavailable. API errors/retry and stale responses remain verified by automated tests rather than forced failures in the production browser.
- README now links the verified live website. This record supersedes historical deployment/browser blockers above.
