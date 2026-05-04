// API
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Pagination
export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;

// Cart
export const FREE_SHIPPING_THRESHOLD = 75;
export const MAX_CART_QUANTITY = 99;

// Loyalty
export const POINTS_PER_DOLLAR = 1;
export const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 2000,
  platinum: 5000,
};

// Product
export const MAX_COMPARE_PRODUCTS = 4;
export const MAX_RECENTLY_VIEWED = 10;
export const LOW_STOCK_THRESHOLD = 10;

// Image
export const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/placeholder/400/400';
export const AVATAR_PLACEHOLDER = 'https://picsum.photos/seed/avatar/200/200';

// Timeouts
export const SEARCH_DEBOUNCE_MS = 300;
export const TOAST_DURATION_MS = 4000;
export const PREFETCH_DELAY_MS = 200;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH: 'nexus_auth',
  GUEST_CART: 'nexus_guest_cart',
  RECENTLY_VIEWED: 'nexus_recently_viewed',
  RECENT_SEARCHES: 'nexus_recent_searches',
  CURRENCY: 'nexus_currency',
  LANGUAGE: 'nexus_lang',
};

// Order statuses with display labels and colors
export const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#FFB800', badgeClass: 'badge-warning' },
  confirmed: { label: 'Confirmed', color: '#00E5FF', badgeClass: 'badge-cyan' },
  processing: { label: 'Processing', color: '#00E5FF', badgeClass: 'badge-cyan' },
  packed: { label: 'Packed', color: '#00E5FF', badgeClass: 'badge-cyan' },
  shipped: { label: 'Shipped', color: '#C9A84C', badgeClass: 'badge-gold' },
  out_for_delivery: { label: 'Out for Delivery', color: '#C9A84C', badgeClass: 'badge-gold' },
  delivered: { label: 'Delivered', color: '#00C896', badgeClass: 'badge-success' },
  cancelled: { label: 'Cancelled', color: '#FF4D6D', badgeClass: 'badge-error' },
  return_requested: { label: 'Return Requested', color: '#FFB800', badgeClass: 'badge-warning' },
  return_approved: { label: 'Return Approved', color: '#00C896', badgeClass: 'badge-success' },
  returned: { label: 'Returned', color: '#FF4D6D', badgeClass: 'badge-error' },
  refunded: { label: 'Refunded', color: '#00C896', badgeClass: 'badge-success' },
};

// Sort options
export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'bestseller', label: 'Best Sellers' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'most_reviewed', label: 'Most Reviewed' },
];
