from enum import Enum
from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class Category(str, Enum):
    ELECTRONICS = "Electronics"
    APPAREL = "Apparel"
    FOOTWEAR = "Footwear"
    HOME = "Home & Living"
    SPORTS = "Sports & Outdoors"


class SortOrder(str, Enum):
    DEFAULT = "default"
    PRICE_ASC = "price_asc"
    PRICE_DESC = "price_desc"
    RATING_DESC = "rating_desc"


class Product(BaseModel):
    model_config = ConfigDict(frozen=True, allow_inf_nan=False)
    id: int = Field(gt=0)
    name: str = Field(min_length=1)
    category: Category
    price: float = Field(ge=0)
    rating: float = Field(ge=1, le=5)
    image: HttpUrl


class ProductPage(BaseModel):
    products: list[Product]
    total: int
    currency: str = "INR"


class CatalogMetadata(BaseModel):
    categories: list[str]
    min_price: float
    max_price: float
    currency: str = "INR"
