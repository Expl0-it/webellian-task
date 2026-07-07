import { API_BASE_URL } from '../constants';

/**
 * Wraps fetch with consistent JSON handling and error parsing.
 * On a non-2xx response it throws an Error; if the backend returned a
 * field-level validation map (see GlobalExceptionHandler), it is attached
 * as `err.fieldErrors` so forms can surface it next to the right input.
 */
async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });

  if (!res.ok) {
    let data = null;
    try {
      data = await res.json();
    } catch {
      // response had no JSON body
    }
    const err = new Error(data?.message || 'Request failed');
    if (data?.errors) err.fieldErrors = data.errors;
    throw err;
  }

  if (res.status === 204) return null; // no content (deletes)
  return res.json();
}

// ---- Products ----

export function getProducts() {
  return request(API_BASE_URL);
}

export function getProduct(productId) {
  return request(`${API_BASE_URL}/${productId}`);
}

export function createProduct(product) {
  return request(API_BASE_URL, { method: 'POST', body: JSON.stringify(product) });
}

export function updateProduct(productId, product) {
  return request(`${API_BASE_URL}/${productId}`, { method: 'PUT', body: JSON.stringify(product) });
}

export function deleteProduct(productId) {
  return request(`${API_BASE_URL}/${productId}`, { method: 'DELETE' });
}

// ---- Covers (nested under a product) ----

export function addCover(productId, cover) {
  return request(`${API_BASE_URL}/${productId}/covers`, {
    method: 'POST',
    body: JSON.stringify(cover),
  });
}

export function updateCover(productId, coverId, cover) {
  return request(`${API_BASE_URL}/${productId}/covers/${coverId}`, {
    method: 'PUT',
    body: JSON.stringify(cover),
  });
}

export function deleteCover(productId, coverId) {
  return request(`${API_BASE_URL}/${productId}/covers/${coverId}`, { method: 'DELETE' });
}
