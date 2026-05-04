'use strict';

process.env.JWT_ACCESS_SECRET = 'test_access_secret_integration';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_integration';
process.env.MONGODB_URI = 'mongodb://localhost:27017/nexus_test_products';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User.model');
const Category = require('../../src/models/Category.model');
const Product = require('../../src/models/Product.model');

let mongod;
let sellerToken;
let sellerId;
let categoryId;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Create a seller user
  const registerRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ firstName: 'Seller', lastName: 'Test', email: 'seller@test.com', password: 'Password@123' });

  sellerToken = registerRes.body.data?.accessToken;
  sellerId = registerRes.body.data?.user?._id;

  // Promote to seller
  await User.findByIdAndUpdate(sellerId, { role: 'seller' });

  // Create a category
  const cat = await Category.create({ name: 'Electronics', slug: 'electronics', level: 0 });
  categoryId = cat._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await Product.deleteMany({});
});

describe('GET /api/v1/products', () => {
  beforeEach(async () => {
    await Product.create([
      {
        title: 'Test Product 1',
        slug: 'test-product-1',
        description: 'Description 1',
        seller: sellerId,
        category: categoryId,
        basePrice: 99.99,
        stock: 10,
        status: 'active',
        isPublished: true,
      },
      {
        title: 'Test Product 2',
        slug: 'test-product-2',
        description: 'Description 2',
        seller: sellerId,
        category: categoryId,
        basePrice: 49.99,
        stock: 5,
        status: 'active',
        isPublished: true,
      },
    ]);
  });

  it('should return paginated products', async () => {
    const res = await request(app).get('/api/v1/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.total).toBe(2);
  });

  it('should filter by price range', async () => {
    const res = await request(app)
      .get('/api/v1/products')
      .query({ minPrice: 60, maxPrice: 150 });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].basePrice).toBe(99.99);
  });

  it('should sort by price ascending', async () => {
    const res = await request(app)
      .get('/api/v1/products')
      .query({ sort: 'price_asc' });

    expect(res.status).toBe(200);
    expect(res.body.data[0].basePrice).toBe(49.99);
    expect(res.body.data[1].basePrice).toBe(99.99);
  });

  it('should respect pagination', async () => {
    const res = await request(app)
      .get('/api/v1/products')
      .query({ page: 1, limit: 1 });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.totalPages).toBe(2);
  });
});

describe('POST /api/v1/products', () => {
  it('should create a product when authenticated as seller', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        title: 'New Product',
        description: 'A great product',
        basePrice: 29.99,
        category: categoryId,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('New Product');
    expect(res.body.data.seller).toBe(sellerId);
  });

  it('should return 401 without authentication', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .send({ title: 'Product', description: 'Desc', basePrice: 10, category: categoryId });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/products/featured', () => {
  it('should return featured products', async () => {
    await Product.create({
      title: 'Featured Product',
      slug: 'featured-product',
      description: 'Featured',
      seller: sellerId,
      category: categoryId,
      basePrice: 199.99,
      stock: 20,
      status: 'active',
      isPublished: true,
      isFeatured: true,
    });

    const res = await request(app).get('/api/v1/products/featured');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].isFeatured).toBe(true);
  });
});
