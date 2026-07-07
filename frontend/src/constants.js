export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/products';

export const PRODUCT_TYPES = ['LIFE', 'HOME', 'TRAVEL', 'AUTO'];

export const COVER_TYPES = [
  'MEDICAL',
  'BAGGAGE',
  'LIABILITY',
  'PROPERTY_DAMAGE',
  'THEFT',
  'NATURAL_DISASTER',
  'TRIP_CANCELLATION',
  'OTHER',
];

export const PRODUCT_TYPE_COLOR = {
  LIFE: 'primary',
  HOME: 'secondary',
  TRAVEL: 'warning',
  AUTO: 'info',
};
