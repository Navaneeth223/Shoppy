'use strict';

process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

const { parsePagination, parseSort } = require('../../src/utils/pagination');

describe('Pagination Utils', () => {
  describe('parsePagination()', () => {
    it('should return defaults when no params provided', () => {
      const result = parsePagination({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(0);
    });

    it('should parse valid page and limit', () => {
      const result = parsePagination({ page: '3', limit: '10' });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
      expect(result.skip).toBe(20);
    });

    it('should clamp page to minimum of 1', () => {
      const result = parsePagination({ page: '-5' });
      expect(result.page).toBe(1);
    });

    it('should clamp limit to maximum of 100', () => {
      const result = parsePagination({ limit: '500' });
      expect(result.limit).toBe(100);
    });

    it('should use custom defaults', () => {
      const result = parsePagination({}, { page: 2, limit: 50 });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });
  });

  describe('parseSort()', () => {
    it('should return price ascending sort', () => {
      const sort = parseSort('price_asc');
      expect(sort).toEqual({ basePrice: 1 });
    });

    it('should return price descending sort', () => {
      const sort = parseSort('price_desc');
      expect(sort).toEqual({ basePrice: -1 });
    });

    it('should return newest sort', () => {
      const sort = parseSort('newest');
      expect(sort).toEqual({ createdAt: -1 });
    });

    it('should return bestseller sort', () => {
      const sort = parseSort('bestseller');
      expect(sort).toEqual({ soldCount: -1 });
    });

    it('should return default sort for unknown value', () => {
      const sort = parseSort('unknown_sort');
      expect(sort).toEqual({ createdAt: -1 });
    });
  });
});

describe('Slug Utils', () => {
  const { createSlug } = require('../../src/utils/slugify');

  it('should convert title to slug', () => {
    expect(createSlug('Hello World')).toBe('hello-world');
  });

  it('should handle special characters', () => {
    expect(createSlug('Product & More!')).toBe('product-and-more');
  });

  it('should handle multiple spaces', () => {
    expect(createSlug('Multiple   Spaces')).toBe('multiple-spaces');
  });

  it('should lowercase the result', () => {
    expect(createSlug('UPPERCASE')).toBe('uppercase');
  });
});
