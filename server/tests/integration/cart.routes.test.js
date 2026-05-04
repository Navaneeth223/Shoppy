'use strict';

process.env.JWT_ACCESS_SECRET = 'test_access_secret_cart';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_cart';
process.env.MONGODB_URI = 'mongodb://localhost:27017/nexus_test_cart';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User.model');
const Product = require('../../src/models/Product.model');
const Category = require('../../src/models/Category.model');
const Inventory = require('../../src/models/Inventory.model');

let mongod;
let userToken;
let userId;
let productId;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  const registerRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ firstName: 'Cart', lastName: 'User', email: 'cart@test.com', password: 'Password@123' });

  userToken = registerRes.body.data?.accessToken;
  userId = registerRes.body.data?.user?._id;

  const cat = await Category.create({ name: 'Test', slug: 'test', level: 0 });

  const product = await Product.create({
    title: 'Cart Test Product',
    slug: 'cart-test-product',
    description: 'For cart testing',
    seller: userId,
    category: cat._id,
    basePrice: 25.00,
    stock: 50,
    status: 'active',
    isPublished: true,
  });
  productId = product._id;

  await Inventory.create({
    product: productId,
    seller: userId,
    variantKey: 'default',
    stock: 50,
    lowStockThreshold: 5,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Cart Operations', () => {
  it('should add item to cart', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.itemCount).toBe(2);
  });

  it('should get cart with items', async () => {
    const res = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeDefined();
  });

  it('should apply valid coupon', async () => {
    const Coupon = require('../../src/models/Coupon.model');
    await Coupon.create({
      code: 'TEST10',
      type: 'percentage',
      value: 10,
      startDate: new Date(Date.now() - 1000),
      endDate: new Date(Date.now() + 86400000),
      isActive: true,
      createdBy: userId,
    });

    const res = await request(app)
      .post('/api/v1/cart/apply-coupon')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'TEST10' });

    expect(res.status).toBe(200);
    expect(res.body.data.coupon.code).toBe('TEST10');
  });

  it('should reject invalid coupon', async () => {
    const res = await request(app)
      .post('/api/v1/cart/apply-coupon')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'INVALID_CODE' });

    expect(res.status).toBe(400);
  });

  it('should remove coupon', async () => {
    const res = await request(app)
      .delete('/api/v1/cart/coupon')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });

  it('should clear cart', async () => {
    const res = await request(app)
      .delete('/api/v1/cart')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });
});
