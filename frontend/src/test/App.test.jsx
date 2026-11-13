import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import App from '../App';

const metadata = { categories: ['Electronics', 'Apparel', 'Footwear'], min_price: 149, max_price: 14999, currency: 'INR' };
const product = { id: 1, name: 'Server supplied headphones', category: 'Electronics', price: 4999, rating: 4.6, image: 'https://example.com/image.jpg' };
const page = { products: [product], total: 1, currency: 'INR' };
let fetchMock;
const ok = data => Promise.resolve({ ok: true, json: async () => data });
const productCalls = () => fetchMock.mock.calls.filter(([url]) => url.startsWith('/api/products'));
const latestQuery = () => new URLSearchParams(productCalls().at(-1)[0].split('?')[1]);

beforeEach(() => {
  fetchMock = vi.fn(url => ok(url === '/api/catalog' ? metadata : page));
  vi.stubGlobal('fetch', fetchMock);
});

async function load() {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole('heading', { name: product.name });
  return user;
}

test('renders server products, server count, price and accessible rating', async () => {
  await load();
  expect(screen.getByText('₹4,999')).toBeInTheDocument();
  expect(screen.getByLabelText('4.6 out of 5 stars')).toBeInTheDocument();
  expect(screen.getByText(/products found/)).toHaveTextContent('1 products found');
  expect(latestQuery().has('min_price')).toBe(false);
  expect(screen.getAllByRole('slider')).toHaveLength(2);
});

test('category multiselect, rating and sort send state and preserve the server order', async () => {
  const user = await load();
  await user.click(screen.getByRole('checkbox', { name: 'Apparel' }));
  await user.click(screen.getByRole('checkbox', { name: 'Footwear' }));
  await user.click(screen.getByRole('radio', { name: '5 stars and above' }));
  await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'rating_desc');
  await waitFor(() => expect(latestQuery().getAll('categories')).toEqual(['Apparel', 'Footwear']));
  expect(latestQuery().get('min_rating')).toBe('5');
  expect(latestQuery().get('sort')).toBe('rating_desc');
  // The fixture intentionally doesn't match the criteria: presentation must trust the server.
  expect(await screen.findByRole('heading', { name: product.name })).toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', { name: 'Apparel' }));
  expect(latestQuery().getAll('categories')).toEqual(['Footwear']);
});

test('both range thumbs update request bounds using keyboard input', async () => {
  await load();
  act(() => screen.getByRole('slider', { name: 'Minimum price' }).focus());
  fireEvent.keyDown(screen.getByRole('slider', { name: 'Minimum price' }), { key: 'ArrowRight' });
  await waitFor(() => expect(latestQuery().get('min_price')).toBe('150'));
  act(() => screen.getByRole('slider', { name: 'Maximum price' }).focus());
  fireEvent.keyDown(screen.getByRole('slider', { name: 'Maximum price' }), { key: 'ArrowLeft' });
  await waitFor(() => expect(latestQuery().get('max_price')).toBe('14998'));
});

test('empty screen reset clears all criteria, sorting and slider positions', async () => {
  const user = await load();
  await user.click(screen.getByRole('checkbox', { name: 'Electronics' }));
  await user.selectOptions(screen.getByRole('combobox'), 'price_asc');
  act(() => screen.getByRole('slider', { name: 'Minimum price' }).focus());
  fireEvent.keyDown(screen.getByRole('slider', { name: 'Minimum price' }), { key: 'ArrowRight' });
  fetchMock.mockImplementation(url => ok(url === '/api/catalog' ? metadata : url.includes('min_rating=5') ? { products: [], total: 0 } : page));
  await user.click(screen.getByRole('radio', { name: '5 stars and above' }));
  expect(await screen.findByText('No items match your criteria.')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: product.name })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Reset Filters' }));
  await screen.findByRole('heading', { name: product.name });
  expect(latestQuery().toString()).toBe('sort=default');
  expect(screen.getByRole('checkbox', { name: 'Electronics' })).not.toBeChecked();
  expect(screen.getByRole('radio', { name: 'Any rating' })).toBeChecked();
  expect(screen.getByRole('combobox')).toHaveValue('default');
  expect(screen.getByRole('slider', { name: 'Minimum price' })).toHaveAttribute('aria-valuenow', '149');
  expect(screen.getByRole('slider', { name: 'Maximum price' })).toHaveAttribute('aria-valuenow', '14999');
});

test('shows loading, error and retry recovery', async () => {
  fetchMock.mockImplementation(() => Promise.reject(new TypeError('offline')));
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByLabelText('Loading products')).toBeInTheDocument();
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the catalog');
  fetchMock.mockImplementation(url => ok(url === '/api/catalog' ? metadata : page));
  await user.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByRole('heading', { name: product.name })).toBeInTheDocument();
});

test('older requests cannot overwrite newer filter results', async () => {
  const user = await load();
  let resolveOld;
  fetchMock.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }));
  await user.click(screen.getByRole('checkbox', { name: 'Apparel' }));
  await user.click(screen.getByRole('checkbox', { name: 'Footwear' }));
  await screen.findByRole('heading', { name: product.name });
  await act(async () => { resolveOld({ ok: true, json: async () => ({ products: [], total: 0 }) }); });
  expect(screen.getByRole('heading', { name: product.name })).toBeInTheDocument();
});

test('mobile filter button toggles accessible panel and image failure has fallback', async () => {
  const user = await load();
  const button = screen.getByRole('button', { name: 'Filters', exact: true });
  expect(button).toHaveAttribute('aria-expanded', 'false');
  await user.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');
  fireEvent.error(screen.getByRole('img', { name: product.name }));
  expect(screen.getByText('Image unavailable')).toBeInTheDocument();
});

test.each([422, 500])('HTTP %i shows a useful error without claiming zero matches', async status => {
  fetchMock.mockImplementation(url => url === '/api/catalog' ? ok(metadata) : Promise.resolve({ ok: false, status }));
  const user = userEvent.setup();
  render(<App />);
  const error = await screen.findByRole('alert');
  expect(error).toHaveTextContent(status === 422 ? 'filter values are not valid' : 'could not load the catalog');
  expect(screen.getByText('Catalog unavailable')).toBeInTheDocument();
  expect(screen.queryByText(/products found/)).not.toBeInTheDocument();
  fetchMock.mockImplementation(url => ok(url === '/api/catalog' ? metadata : page));
  await user.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByRole('heading', { name: product.name })).toBeInTheDocument();
});
