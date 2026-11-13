# Quantiphi Product Multi-Filter Catalog

React + Vite + Tailwind CSS frontend and Python FastAPI backend. No database is required: the inventory is a validated JSON array of 40 products priced in INR.

## Run locally

Requires Python 3.10+ and Node.js 20.19+.

Backend (from the repository root):

```sh
cd backend
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows PowerShell instead: .venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python -m uvicorn app.main:app --reload --port 8000
```

Frontend in a second terminal:

```sh
cd frontend
npm ci
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to FastAPI on port 8000. Interactive API documentation: http://localhost:8000/docs.

## API contract

- `GET /api/health`: service readiness.
- `GET /api/catalog`: categories, price limits and currency calculated on the server.
- `GET /api/products`: `{ "products": [...], "total": 40, "currency": "INR" }`.

Example:

```text
/api/products?categories=Electronics&categories=Footwear&min_price=699&max_price=5000&min_rating=4&sort=price_asc
```

Repeat `categories` for multiple selections. Categories are ORed; all other criteria intersect with AND. Prices are inclusive, and ratings are minimum thresholds (1–5, including decimals). Omit any filter to bypass it. Omit all filters to return all 40 products. Zero is a valid price boundary. Unknown categories, invalid numbers, non-finite numbers, out-of-range ratings, reversed price bounds and unsupported sorting receive HTTP 422.

Supported sorting: `default`, `price_asc`, `price_desc`, `rating_desc`. Filtering runs first; sorting uses a new result list and deterministic ID tie-breakers. Reset requests omit every filter and use default sorting. Explicit empty query strings are invalid; clear a filter by omitting it.

CORS defaults to localhost and 127.0.0.1 on port 5173. Set `CORS_ORIGINS` to a comma-separated origin list for other environments. No credentials are required.

## Tests and build

```sh
cd backend
python -m pytest -q
# From frontend/:
npm test
npm run build
```

Tests cover a matrix of combinations, sorting, null inputs, inclusive boundaries, empty results/reset at the API level, invalid requests, CORS and source inventory immutability.

## Structure

- `backend/app/main.py`: API routes, query validation and CORS.
- `backend/app/catalog.py`: inventory loading and filter-then-sort service.
- `backend/app/models.py`: response and inventory schemas.
- `backend/app/data/products.json`: 40-product inventory.
- `backend/tests/`: automated backend/API tests.
- `frontend/src/`: React presentation and Tailwind styling.

## Catalog UI

The responsive catalog has a sticky desktop sidebar and a collapsible mobile filter panel, category checkboxes, a genuine Radix two-thumb price slider, rating radios from 1 to 5, sorting dropdown, server product count, loading skeletons, retryable errors and an empty-results reset action. Reset all restores categories, full price bounds, any rating and featured ordering. Every change immediately requests server results, and obsolete requests are aborted and ignored.

`frontend/src/components/` contains reusable filter, slider, toolbar, result, card and rating components. `hooks/useCatalog.js` owns request and interaction state; `lib/api.js` serializes query parameters. No client filtering or sorting is performed.

Seven automated frontend tests exercise control updates, keyboard operation of both price thumbs, reset from empty results, error/retry, stale-response protection, mobile panel expansion and image fallback. These use jsdom and mocked HTTP responses; they do not verify browser layout, pointer dragging, external images or live end-to-end behavior. Browser visual and end-to-end verification remain pending because the cloud browser cannot access this workspace's loopback server.

Images use external Unsplash URLs and require internet access. Image availability must be checked during UI verification. Do not modify or push the assessment repository after the organizer's confirmed cutoff. The provided materials conflict (12:00 PM submission line versus 1:00–2:30 PM round); the round announcement states 2:30 PM IST.
