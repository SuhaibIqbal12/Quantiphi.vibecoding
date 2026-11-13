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
