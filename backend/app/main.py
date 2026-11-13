import os
from typing import Annotated
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from .catalog import PRODUCTS, filter_products
from .models import CatalogMetadata, Category, ProductPage, SortOrder

app = FastAPI(title="Quantiphi Product Catalog", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",") if origin.strip()],
    allow_methods=["GET"],
    allow_headers=["Accept", "Content-Type"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/catalog", response_model=CatalogMetadata)
def catalog():
    return CatalogMetadata(
        categories=sorted({product.category.value for product in PRODUCTS}),
        min_price=min(product.price for product in PRODUCTS),
        max_price=max(product.price for product in PRODUCTS),
    )


@app.get("/api/products", response_model=ProductPage)
def products(
    categories: Annotated[list[Category] | None, Query()] = None,
    min_price: Annotated[float | None, Query(ge=0, allow_inf_nan=False)] = None,
    max_price: Annotated[float | None, Query(ge=0, allow_inf_nan=False)] = None,
    min_rating: Annotated[float | None, Query(ge=1, le=5, allow_inf_nan=False)] = None,
    sort: SortOrder = SortOrder.DEFAULT,
):
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(status_code=422, detail="min_price must not exceed max_price")
    matches = filter_products(PRODUCTS, categories, min_price, max_price, min_rating, sort)
    return ProductPage(products=matches, total=len(matches))
