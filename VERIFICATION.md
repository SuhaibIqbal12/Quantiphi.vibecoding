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
