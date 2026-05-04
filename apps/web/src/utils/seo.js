const SITE_NAME = 'Nexus Commerce';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://nexuscommerce.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Builds a full page title.
 * @param {string} [pageTitle]
 * @returns {string}
 */
export function buildTitle(pageTitle) {
  if (!pageTitle) return SITE_NAME;
  return `${pageTitle} | ${SITE_NAME}`;
}

/**
 * Builds Open Graph meta tags for a product.
 * @param {object} product
 * @returns {object}
 */
export function buildProductMeta(product) {
  const price = product.effectivePrice || product.salePrice || product.basePrice;
  return {
    title: product.title,
    description: product.shortDescription || product.description?.replace(/<[^>]*>/g, '').slice(0, 160),
    image: product.images?.[0]?.url || DEFAULT_IMAGE,
    type: 'product',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.shortDescription,
      image: product.images?.map((img) => img.url),
      sku: product.sku,
      brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : undefined,
      offers: {
        '@type': 'Offer',
        price: price?.toFixed(2),
        priceCurrency: 'USD',
        availability:
          product.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        url: `${SITE_URL}/product/${product.slug}`,
      },
      aggregateRating:
        product.ratings?.count > 0
          ? {
              '@type': 'AggregateRating',
              ratingValue: product.ratings.average,
              reviewCount: product.ratings.count,
            }
          : undefined,
    },
  };
}

/**
 * Builds breadcrumb structured data.
 * @param {Array<{name: string, url: string}>} items
 * @returns {object}
 */
export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Builds organization structured data.
 * @returns {object}
 */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-555-1234',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
    sameAs: [
      'https://twitter.com/nexuscommerce',
      'https://instagram.com/nexuscommerce',
      'https://facebook.com/nexuscommerce',
    ],
  };
}
