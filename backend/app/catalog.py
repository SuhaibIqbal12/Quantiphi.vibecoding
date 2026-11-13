import json
from pathlib import Path
from .models import Product, SortOrder

# Validate our source inventory once at startup; keep it immutable across requests.
PRODUCTS = tuple(Product.model_validate(item) for item in json.loads(
    Path(__file__).with_name("data").joinpath("products.json").read_text()
))
if len({product.id for product in PRODUCTS}) != len(PRODUCTS):
    raise ValueError("Inventory product IDs must be unique")


def filter_products(inventory, categories=None, min_price=None, max_price=None,
                    min_rating=None, sort=SortOrder.DEFAULT):
    """OR within categories; AND across criteria. Filter before sorting a copy."""
    selected = set(categories or [])
    matches = []
    for product in inventory:
        if selected and product.category not in selected:
            continue
        if min_price is not None and product.price < min_price:
            continue
        if max_price is not None and product.price > max_price:
            continue
        if min_rating is not None and product.rating < min_rating:
            continue
        matches.append(product)

    # ID provides a predictable tie-breaker. Never sort the master inventory.
    if sort == SortOrder.PRICE_ASC:
        matches.sort(key=lambda product: (product.price, product.id))
    elif sort == SortOrder.PRICE_DESC:
        matches.sort(key=lambda product: (-product.price, product.id))
    elif sort == SortOrder.RATING_DESC:
        matches.sort(key=lambda product: (-product.rating, product.id))
    return matches
