'use strict';

process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

const Inventory = require('../../src/models/Inventory.model');
const inventoryService = require('../../src/services/inventory.service');

describe('Inventory Service', () => {
  let productId;
  let sellerId;

  beforeEach(async () => {
    productId = new mongoose.Types.ObjectId();
    sellerId = new mongoose.Types.ObjectId();

    await Inventory.create({
      product: productId,
      seller: sellerId,
      variantKey: 'default',
      variantLabel: 'Default',
      stock: 100,
      reservedStock: 0,
      lowStockThreshold: 5,
    });
  });

  describe('checkAvailability()', () => {
    it('should return available=true when stock is sufficient', async () => {
      const result = await inventoryService.checkAvailability([
        { product: productId, variantKey: 'default', quantity: 10 },
      ]);

      expect(result.available).toBe(true);
      expect(result.unavailableItems).toHaveLength(0);
    });

    it('should return available=false when stock is insufficient', async () => {
      const result = await inventoryService.checkAvailability([
        { product: productId, variantKey: 'default', quantity: 200 },
      ]);

      expect(result.available).toBe(false);
      expect(result.unavailableItems).toHaveLength(1);
      expect(result.unavailableItems[0].available).toBe(100);
    });

    it('should return available=false for non-existent inventory', async () => {
      const fakeProductId = new mongoose.Types.ObjectId();
      const result = await inventoryService.checkAvailability([
        { product: fakeProductId, variantKey: 'default', quantity: 1 },
      ]);

      expect(result.available).toBe(false);
    });
  });

  describe('reserveInventory()', () => {
    it('should increase reservedStock', async () => {
      const order = {
        orderNumber: 'NX-2024-000001',
        _id: new mongoose.Types.ObjectId(),
        items: [{ product: productId, variantKey: 'default', quantity: 5 }],
      };

      await inventoryService.reserveInventory(order);

      const inventory = await Inventory.findOne({ product: productId });
      expect(inventory.reservedStock).toBe(5);
      expect(inventory.availableStock).toBe(95);
    });
  });

  describe('releaseInventory()', () => {
    it('should decrease reservedStock', async () => {
      // First reserve
      await Inventory.findOneAndUpdate(
        { product: productId },
        { $inc: { reservedStock: 10 } }
      );

      const order = {
        orderNumber: 'NX-2024-000001',
        _id: new mongoose.Types.ObjectId(),
        items: [{ product: productId, variantKey: 'default', quantity: 10 }],
      };

      await inventoryService.releaseInventory(order);

      const inventory = await Inventory.findOne({ product: productId });
      expect(inventory.reservedStock).toBe(0);
    });
  });
});
