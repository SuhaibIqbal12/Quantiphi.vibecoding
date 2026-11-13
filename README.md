# Quantiphi E-Commerce Product Catalog

A responsive marketplace browsing interface built for the Quantiphi Vibe Coding assessment. Browse 40 realistic products across five categories using category selection, a genuine two-thumb price slider and a minimum star rating. Every control updates the catalog automatically through FastAPI; there is no Submit button and no browser-side filtering or sorting.

**Repository:** https://github.com/SuhaibIqbal12/Quantiphi.vibecoding

**Live demo:** Suhaib Vercel sign-in verified; deployment pending final push approval. No public URL is claimed yet.

## Features

- Sticky desktop filter sidebar and collapsible mobile panel.
- Multiple category checkboxes, inclusive min/max price bounds, and minimum ratings from 1 to 5.
- Responsive product cards with image, name, INR price and rating.
- Featured order, Price: Low to High and Top Rated First.
- Server-calculated matching count, loading skeletons, API errors with retry and image fallback.
- Empty-results screen and Reset Filters; Reset all also clears sorting.
- Request cancellation and stale-response protection for rapid changes.
- No database, authentication keys or paid API services required.

## Technology and requirements

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Radix Slider |
| Backend | Python, FastAPI, Pydantic, Uvicorn |
| Inventory | Validated JSON array, 40 products in INR |
| Testing | pytest, FastAPI TestClient, Vitest, Testing Library, jsdom |
| Optional hosting | Vercel frontend/backend services or Docker |

Install Python 3.10+ (3.12 recommended), Node.js 22+ and Git. Internet access is needed for installation and externally hosted product images.

## Installation

Clone the public repository:

```sh
git clone https://github.com/SuhaibIqbal12/Quantiphi.vibecoding.git
cd Quantiphi.vibecoding
```

Create the backend environment:

```sh
cd backend
python -m venv .venv
```

Activate it using the command for your terminal:

| Terminal | Command |
| --- | --- |
| Windows PowerShell | `.venv\Scripts\Activate.ps1` |
| Windows Command Prompt | `.venv\Scripts\activate.bat` |
| macOS/Linux | `source .venv/bin/activate` |

Install backend runtime and test dependencies:

```sh
python -m pip install -r requirements-dev.txt
```

For exactly the Python dependency versions used in verification, install `requirements-lock.txt` instead. Frontend dependencies are locked by `package-lock.json`.

In a second terminal, from the repository root:

```sh
cd frontend
npm ci
```

## Start the application

Backend terminal, inside `backend/` with the virtual environment activated:

```sh
python -m uvicorn app.main:app --reload --port 8000
```

Frontend terminal, inside `frontend/`:

```sh
npm run dev
```

- Catalog: http://127.0.0.1:5173
- Interactive API documentation: http://127.0.0.1:8000/docs
- Health endpoint: http://127.0.0.1:8000/api/health

Vite forwards `/api` requests to port 8000, so both processes must be running in development. The frontend uses relative API URLs; no client-side secret or API key is required.

## API reference

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Returns `{ "status": "ok" }` |
| `GET /api/catalog` | Server-derived categories, price limits and currency |
| `GET /api/products` | Filtered and sorted products, matching total and currency |

| Query parameter | Accepted values |
| --- | --- |
| `categories` | Repeat for multiple categories: Electronics, Apparel, Footwear, Home & Living, Sports & Outdoors |
| `min_price` | Finite number greater than or equal to 0; inclusive |
| `max_price` | Finite number greater than or equal to 0; inclusive |
| `min_rating` | Finite number from 1 to 5; inclusive minimum |
| `sort` | `default`, `price_asc`, `price_desc`, `rating_desc` |

Examples:

```text
http://127.0.0.1:8000/api/products
http://127.0.0.1:8000/api/products?categories=Electronics
http://127.0.0.1:8000/api/products?categories=Electronics&categories=Footwear&min_price=699&max_price=5000&min_rating=4&sort=price_asc
http://127.0.0.1:8000/api/products?min_rating=4&sort=rating_desc
```

The response has this structure; the example below represents an empty result:

```json
{ "products": [], "total": 0, "currency": "INR" }
```

Products contain `id`, `name`, `category`, `price`, `rating` and `image`. Invalid categories, non-numeric or non-finite numbers, negative prices, reversed price bounds, ratings outside 1–5 and unsupported sort options return HTTP 422. Clear a filter by omitting its query parameter; empty strings are invalid. Zero is a valid price bound.

CORS permits localhost and 127.0.0.1 on port 5173 by default. Override `CORS_ORIGINS` with a comma-separated list for other origins. The production same-origin setup does not require cross-origin requests.

## Filter and sorting logic

1. FastAPI validates the request values before processing.
2. The backend loops through the original inventory. A product must match any selected category **AND** satisfy `min_price <= price <= max_price` **AND** meet `rating >= min_rating`.
3. Unselected criteria are skipped. With no active filters, every product qualifies.
4. Only after filtering does the backend sort the matching list. Product IDs provide deterministic tie-breaks; the original inventory is not mutated.
5. The backend returns the matching count and products. React renders the response in that order.

Category selection is OR within the category group: Electronics and Footwear means either category. All different filter groups intersect using AND. React only holds UI state, formats presentation values, serializes parameters and displays server responses. It performs no product filtering, sorting, matching counts or price-bound calculations.

## Architecture

| File or folder | Responsibility |
| --- | --- |
| `backend/app/main.py` | API routes, query validation, CORS and optional production static hosting |
| `backend/app/catalog.py` | Inventory loading and filter-then-sort service |
| `backend/app/models.py` | Product, category, sorting and response schemas |
| `backend/app/data/products.json` | Master product inventory |
| `backend/tests/` | Automated backend/API checks |
| `frontend/src/App.jsx` | Page composition |
| `frontend/src/components/` | Sidebar, slider, toolbar, cards, ratings and result states |
| `frontend/src/hooks/useCatalog.js` | Selected state, requests, reset, retry and cancellation |
| `frontend/src/lib/api.js` | Query serialization and HTTP response handling |
| `frontend/src/test/` | Component tests and real HTTP integration tests |
| `vercel.json` | Frontend/backend service routing for Vercel |

## Tests and production build

Backend, inside `backend/` with the environment activated:

```sh
python -m pytest -q
```

Frontend, inside `frontend/`:

```sh
npm test
npm run build
```

With both development apps running, use another terminal inside `frontend/`:

```sh
npm run test:integration
```

The integration suite mounts React in jsdom and sends real HTTP requests through Vite to FastAPI. Product responses are not mocked. `CATALOG_BASE_URL` can point it at another running origin. The normal component suite uses mocked responses for errors, retry and stale-response scenarios.

Latest executed checks: **171 backend tests**, **9 frontend component tests**, **5 live integration tests**, and the frontend production build passed. Tests cover no filters, single/multiple categories, inclusive exact-price boundaries, rating thresholds, intersecting criteria, both sort orders, empty results/reset, invalid input, CORS, source immutability, API failures and stale responses.

Build the frontend before backend tests to include the production static-hosting check; otherwise that one check is skipped. One upstream Starlette/AnyIO deprecation warning does not fail tests.

See [QA_CHECKLIST.md](QA_CHECKLIST.md) and [VERIFICATION.md](VERIFICATION.md) for evidence and limitations. Real-browser responsive layout, pointer dragging and image rendering remain unverified because the cloud browser could not access the local preview. All 40 image URLs returned HTTP 200 after replacing one broken URL. Screenshots are omitted because no verified browser screenshots are available.

## Production deployment

### Vercel

Import this repository with the **repository root** as the root directory. `vercel.json` defines a Vite frontend and FastAPI backend in one project using Vercel Services (Beta). `/api/*`, `/docs` and `/openapi.json` go to FastAPI; other paths go to the frontend. The frontend and backend share an origin, so no API base URL needs to be configured.

The service configuration is prepared but has not been built or deployed by Vercel yet. Browser sign-in is verified. Final source push approval and a READY deployment are still required before publishing a live URL.

### One-process hosting

After `npm run build` inside `frontend/`, start FastAPI. When `frontend/dist` exists, FastAPI serves the catalog at http://127.0.0.1:8000 and retains the API routes. This mode has been executed and tested directly.

Optional Docker commands, from the repository root:

```sh
docker build -t quantiphi-catalog .
docker run --rm -p 8000:8000 quantiphi-catalog
```

The image build itself remains unverified because Docker is unavailable in this workspace. The container binds to the host-provided `PORT`, defaulting to 8000.

## Viva: a simple explanation

“React remembers the categories, price range, rating and sort option selected by the user. Whenever one changes, it sends those values to FastAPI. The backend validates them and checks every product. Different filter groups use AND, so a product must satisfy all active restrictions; multiple selected categories use OR. Then the server sorts only the matching products, counts them and sends the result back. React displays that response. Reset clears the controls, and the backend returns all 40 products. Cancelling old requests and ignoring stale responses prevents rapid slider changes from showing outdated results.”

The backend also calculates the available categories and full price range from inventory. Frontend currency formatting and slider positioning are presentation tasks; the server remains the source of truth for accepted values and matching products.

## Submission

The public repository contains incremental commits for setup, backend processing, the catalog UI, integration tests and QA fixes. Dependencies, generated build files, virtual environments and environment secrets are excluded from Git.

Submit the repository link on Unstop yourself. This project does not submit on your behalf. The supplied materials conflict on a 12:00 PM submission line versus the announced 1:00–2:30 PM round; confirm the applicable cutoff with the organizer. Do not edit, commit or push after the assessment deadline.
