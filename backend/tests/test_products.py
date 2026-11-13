from itertools import product
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.catalog import PRODUCTS, filter_products

client = TestClient(app)


def test_inventory_and_default_response():
    response = client.get('/api/products')
    assert response.status_code == 200
    body = response.json()
    assert body['total'] == 40
    assert len(body['products']) == 40
    assert len({p['id'] for p in body['products']}) == 40
    assert body['currency'] == 'INR'
    assert all(p['name'] and p['image'].startswith('https://') for p in body['products'])
    assert [p['id'] for p in body['products']] == [p.id for p in PRODUCTS]


def test_health_and_metadata():
    assert client.get('/api/health').json() == {'status': 'ok'}
    data = client.get('/api/catalog').json()
    assert len(data['categories']) == 5
    assert data['min_price'] == 149
    assert data['max_price'] == 14999


@pytest.mark.parametrize('categories,low,high,rating,sort', list(product(
    [[], ['Electronics'], ['Apparel', 'Footwear']],
    [None, 699], [None, 3499], [None, 4, 5],
    ['default', 'price_asc', 'price_desc', 'rating_desc'],
)))
def test_combinations_against_independent_oracle(categories, low, high, rating, sort):
    params = [('categories', category) for category in categories]
    params += [(key, value) for key, value in {
        'min_price': low, 'max_price': high, 'min_rating': rating, 'sort': sort,
    }.items() if value is not None]
    response = client.get('/api/products', params=params)
    assert response.status_code == 200
    expected = [p for p in PRODUCTS if
                (not categories or p.category.value in categories) and
                (low is None or p.price >= low) and
                (high is None or p.price <= high) and
                (rating is None or p.rating >= rating)]
    keys = {
        'price_asc': lambda p: (p.price, p.id),
        'price_desc': lambda p: (-p.price, p.id),
        'rating_desc': lambda p: (-p.rating, p.id),
    }
    if sort != 'default':
        expected = sorted(expected, key=keys[sort])
    body = response.json()
    assert [p['id'] for p in body['products']] == [p.id for p in expected]
    assert body['total'] == len(expected)


def test_inclusive_price_and_rating_boundaries():
    body = client.get('/api/products', params={
        'min_price': 4999, 'max_price': 4999, 'min_rating': 4.6,
    }).json()
    assert [p['id'] for p in body['products']] == [1]


def test_empty_and_reset():
    assert client.get('/api/products?min_price=20000').json() == {
        'products': [], 'total': 0, 'currency': 'INR',
    }
    assert client.get('/api/products').json()['total'] == 40


def test_duplicate_categories_and_null_service_inputs():
    response = client.get('/api/products?categories=Electronics&categories=Electronics')
    assert response.json()['total'] == 8
    assert filter_products(PRODUCTS, categories=[]) == list(PRODUCTS)
    assert filter_products(PRODUCTS) == list(PRODUCTS)


@pytest.mark.parametrize('query', [
    'min_price=-1', 'max_price=-1', 'min_price=abc',
    'min_price=NaN', 'max_price=Infinity', 'min_rating=NaN',
    'min_rating=0', 'min_rating=5.1', 'min_rating=abc',
    'min_price=100&max_price=50', 'categories=Unknown',
    'sort=invalid', 'min_price=', 'categories=',
])
def test_invalid_inputs(query):
    assert client.get(f'/api/products?{query}').status_code == 422


def test_zero_price_is_not_treated_as_missing():
    assert client.get('/api/products?max_price=0').json()['total'] == 0


def test_sorting_does_not_mutate_source():
    original = tuple(p.id for p in PRODUCTS)
    client.get('/api/products?sort=rating_desc')
    client.get('/api/products?sort=price_desc')
    assert tuple(p.id for p in PRODUCTS) == original
    assert [p['id'] for p in client.get('/api/products').json()['products']] == list(original)


def test_cors_allowed_and_disallowed_origins():
    allowed = client.options('/api/products', headers={
        'Origin': 'http://localhost:5173', 'Access-Control-Request-Method': 'GET',
    })
    assert allowed.status_code == 200
    assert allowed.headers['access-control-allow-origin'] == 'http://localhost:5173'
    blocked = client.options('/api/products', headers={
        'Origin': 'https://untrusted.example', 'Access-Control-Request-Method': 'GET',
    })
    assert blocked.status_code == 400
    assert 'access-control-allow-origin' not in blocked.headers
