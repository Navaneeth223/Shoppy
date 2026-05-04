import axiosInstance from '../api/axiosInstance';

/**
 * Tracks a product view event.
 * @param {string} productId
 * @param {string} [categoryId]
 */
export function trackProductView(productId, categoryId) {
  axiosInstance.post('/analytics/track', {
    type: 'product_view',
    productId,
    categoryId,
  }).catch(() => {}); // Fire-and-forget
}

/**
 * Tracks a search event.
 * @param {string} query
 * @param {number} resultCount
 */
export function trackSearch(query, resultCount) {
  axiosInstance.post('/analytics/track', {
    type: 'search',
    searchQuery: query,
    searchResultCount: resultCount,
  }).catch(() => {});
}

/**
 * Tracks an add-to-cart event.
 * @param {string} productId
 * @param {number} quantity
 * @param {number} price
 */
export function trackAddToCart(productId, quantity, price) {
  axiosInstance.post('/analytics/track', {
    type: 'add_to_cart',
    productId,
    value: price * quantity,
  }).catch(() => {});
}

/**
 * Tracks a purchase event.
 * @param {string} orderId
 * @param {number} totalAmount
 */
export function trackPurchase(orderId, totalAmount) {
  axiosInstance.post('/analytics/track', {
    type: 'purchase',
    order: orderId,
    value: totalAmount,
  }).catch(() => {});
}

/**
 * Tracks a page view.
 * @param {string} path
 */
export function trackPageView(path) {
  axiosInstance.post('/analytics/track', {
    type: 'page_view',
    metadata: { path },
  }).catch(() => {});
}

/**
 * Tracks a banner click.
 * @param {string} bannerId
 * @param {string} bannerTitle
 */
export function trackBannerClick(bannerId, bannerTitle) {
  axiosInstance.post('/analytics/track', {
    type: 'banner_click',
    metadata: { bannerId, bannerTitle },
  }).catch(() => {});
}
