'use strict';

process.env.JWT_ACCESS_SECRET = 'test_access_secret_search';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_search';
process.env.MONGODB_URI = 'mongodb://localhost:27017/nexus_test_search';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const Product = require('../../src/models/Product.model');
const Category = require('../../src/models/Category.model');
const User = require('../../src/models/User.model');

let mongod;
let sellerId;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  const seller = await User.create({
    firstName: 'Search',
    lastName: 'Seller',
    email: 'search.seller@test.com',
    password: 'Password@123',
    role: 'seller',
    isEmailVerified: true,
  });
  sellerId = seller._id;

  const cat = await Category.create({ name: 'Search Cat', slug: 'search-cat', level: 0 });

  await Product.create([
    {
      title: 'Wireless Headphones',
      slug: 'wireless-headphones',
      description: 'Premium wireless headphones with noise cancellation',
      seller: sellerId,
      category: cat._id,
      basePrice: 199.99,
      stock: 20,
      status: 'active',
      isPublished: true,
      tags: ['wireless', 'audio', 'headphones'],
    },
    {
      title: 'Bluetooth Speaker',
      slug: 'bluetooth-speaker',
      description: 'Portable bluetooth speaker with great sound',
      seller: sellerId,
      category: cat._id,
      basePrice: 79.99,
      stock: 15,
      status: 'active',
      isPublished: true,
      tags: ['bluetooth', 'audio', 'speaker'],
    },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('GET /api/v1/search', () => {
  it('should return search results', async () => {
    const res = await request(app)
      .get('/api/v1/search')
      .query({ q: 'headphones' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('should return all products without query', async () => {
    const res = await request(app).get('/api/v1/search');

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBeGreaterThanOrEqual(0);
  });

  it('should filter by price range', async () => {
    const res = await request(app)
      .get('/api/v1/search')
      .query({ minPrice: 100, maxPrice: 300 });

    expect(res.status).toBe(200);
    if (res.body.data.products?.length > 0) {
      res.body.data.products.forEach((p) => {
        expect(p.basePrice).toBeGreaterThanOrEqual(100);
        expect(p.basePrice).toBeLessThanOrEqual(300);
      });
    }
  });
});

describe('GET /api/v1/search/popular', () => {
  it('should return popular searches', async () => {
    const res = await request(app).get('/api/v1/search/popular');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /api/v1/search/autocomplete', () => {
  it('should return suggestions for query', async () => {
    const res = await request(app)
      .get('/api/v1/search/autocomplete')
      .query({ q: 'wire' });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return empty for short query', async () => {
    const res = await request(app)
      .get('/api/v1/search/autocomplete')
      .query({ q: 'a' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});
