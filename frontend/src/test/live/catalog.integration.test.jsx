import { transferableAbortController } from 'node:util';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import App from '../../App';

// Real HTTP through Vite's proxy to FastAPI; no product responses are mocked.
const realFetch = globalThis.fetch;
const origin = process.env.CATALOG_BASE_URL || 'http://127.0.0.1:5173';
let requests;

beforeEach(() => {
  requests = [];
  // Node fetch requires its native AbortSignal rather than jsdom's DOM signal.
  vi.stubGlobal('AbortController', class { constructor() { return transferableAbortController(); } });
  vi.stubGlobal('fetch', (path, options) => {
    requests.push(path);
    return realFetch(new URL(path, origin), options);
  });
});

const query = () => new URLSearchParams(requests.filter(path => path.startsWith('/api/products')).at(-1).split('?')[1]);
async function matchesServer(path) {
  const response = await realFetch(new URL(path, origin));
  expect(response.status).toBe(200);
  const expected = await response.json();
  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Product catalog' })).toHaveAttribute('aria-busy', 'false');
    expect(screen.queryAllByRole('article').map(article => article.querySelector('h3').textContent))
      .toEqual(expected.products.map(product => product.name));
    expect(screen.getByText(/products found/)).toHaveTextContent(`${expected.total} products found`);
  });
  return expected;
}
async function load() {
  const user = userEvent.setup();
  render(<App />);
  await matchesServer('/api/products');
  return user;
}

test('initial inventory, multiple category selection and clearing categories', async () => {
  const user = await load();
  expect(screen.getAllByRole('article')).toHaveLength(40);
  await user.click(screen.getByRole('checkbox', { name: 'Electronics' }));
  await matchesServer('/api/products?categories=Electronics');
  expect(screen.getAllByRole('article')).toHaveLength(8);
  await user.click(screen.getByRole('checkbox', { name: 'Footwear' }));
  await matchesServer('/api/products?categories=Electronics&categories=Footwear');
  expect(screen.getAllByRole('article')).toHaveLength(16);
  expect(query().getAll('categories')).toEqual(['Electronics', 'Footwear']);
  await user.click(screen.getByRole('checkbox', { name: 'Electronics' }));
  await user.click(screen.getByRole('checkbox', { name: 'Footwear' }));
  await matchesServer('/api/products');
  expect(screen.getAllByRole('article')).toHaveLength(40);
});

test('all five minimum ratings request and display real backend results', async () => {
  const user = await load();
  for (const rating of [1, 2, 3, 4, 5]) {
    await user.click(screen.getByRole('radio', { name: `${rating} stars and above` }));
    await matchesServer(`/api/products?min_rating=${rating}`);
    expect(query().get('min_rating')).toBe(String(rating));
  }
  await user.click(screen.getByRole('radio', { name: 'Any rating' }));
  await matchesServer('/api/products');
  expect(screen.getAllByRole('article')).toHaveLength(40);
});

test('category and rating intersect before both requested sorting orders', async () => {
  const user = await load();
  await user.click(screen.getByRole('checkbox', { name: 'Electronics' }));
  await user.click(screen.getByRole('checkbox', { name: 'Footwear' }));
  await user.click(screen.getByRole('radio', { name: '4 stars and above' }));
  await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'price_asc');
  await matchesServer('/api/products?categories=Electronics&categories=Footwear&min_rating=4&sort=price_asc');
  expect(query().get('sort')).toBe('price_asc');
  await user.selectOptions(screen.getByRole('combobox'), 'rating_desc');
  await matchesServer('/api/products?categories=Electronics&categories=Footwear&min_rating=4&sort=rating_desc');
  expect(query().get('sort')).toBe('rating_desc');
});

test('both slider bounds call the backend and reset restores the entire inventory', async () => {
  const user = await load();
  const minimum = screen.getByRole('slider', { name: 'Minimum price' });
  const maximum = screen.getByRole('slider', { name: 'Maximum price' });
  act(() => minimum.focus());
  fireEvent.keyDown(minimum, { key: 'ArrowRight' });
  act(() => maximum.focus());
  fireEvent.keyDown(maximum, { key: 'ArrowLeft' });
  await matchesServer('/api/products?min_price=150&max_price=14998');
  expect(query().get('min_price')).toBe('150');
  expect(query().get('max_price')).toBe('14998');
  expect(screen.getAllByRole('article')).toHaveLength(38);
  await user.click(screen.getByRole('button', { name: 'Reset all' }));
  await matchesServer('/api/products');
  expect(screen.getAllByRole('article')).toHaveLength(40);
  expect(query().toString()).toBe('sort=default');
});

test('combined criteria produce an empty state and Reset Filters recovers', async () => {
  const user = await load();
  const minimum = screen.getByRole('slider', { name: 'Minimum price' });
  act(() => minimum.focus());
  fireEvent.keyDown(minimum, { key: 'ArrowRight' });
  await user.click(screen.getByRole('checkbox', { name: 'Apparel' }));
  await user.click(screen.getByRole('radio', { name: '5 stars and above' }));
  await user.selectOptions(screen.getByRole('combobox'), 'price_asc');
  await matchesServer('/api/products?categories=Apparel&min_price=150&max_price=14999&min_rating=5&sort=price_asc');
  expect(screen.getByText('No items match your criteria.')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Reset Filters' }));
  await matchesServer('/api/products');
  expect(screen.getAllByRole('article')).toHaveLength(40);
  expect(minimum).toHaveAttribute('aria-valuenow', '149');
  expect(query().toString()).toBe('sort=default');
  expect(screen.getByRole('radio', { name: 'Any rating' })).toBeChecked();
  expect(screen.getByRole('combobox')).toHaveValue('default');
});
