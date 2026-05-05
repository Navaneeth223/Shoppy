'use strict';

/**
 * NEXUS COMMERCE — DATABASE SEED SCRIPT
 * Run from the server directory: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus_commerce';

// Models
const User = require('./src/models/User.model');
const Seller = require('./src/models/Seller.model');
const Category = require('./src/models/Category.model');
const Brand = require('./src/models/Brand.model');
const Product = require('./src/models/Product.model');
const Inventory = require('./src/models/Inventory.model');
const Order = require('./src/models/Order.model');
const Coupon = require('./src/models/Coupon.model');
const Banner = require('./src/models/Banner.model');
const FlashDeal = require('./src/models/FlashDeal.model');

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const img = (seed, w = 600, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function main() {
  console.log('\n🌱 NEXUS COMMERCE — DATABASE SEED\n');

  // Connect — try real MongoDB first, fall back to in-memory
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to MongoDB\n');
  } catch {
    console.log('⚠️  Local MongoDB not found. Using in-memory database...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('✅ Connected to in-memory MongoDB\n');
  }

  // Drop and recreate collections to avoid index conflicts
  console.log('Clearing existing data...');
  const db = mongoose.connection.db;
  const existingCollections = (await db.listCollections().toArray()).map(c => c.name);
  const toDrop = ['users','sellers','categories','brands','products','inventories','orders','coupons','banners','flashdeals'];
  for (const col of toDrop) {
    if (existingCollections.includes(col)) {
      await db.collection(col).drop().catch(() => {});
    }
  }
  console.log('✅ Cleared\n');

  // ─── Users ────────────────────────────────────────────────────────────────
  console.log('Seeding users...');
  const hashedAdminPw = await bcrypt.hash('Admin@123!', 12);
  const hashedSellerPw = await bcrypt.hash('Seller@123!', 12);
  const hashedCustomerPw = await bcrypt.hash('Customer@123!', 12);

  const superadmin = await User.create({
    firstName: 'Super', lastName: 'Admin',
    email: 'superadmin@nexuscommerce.com',
    password: hashedAdminPw,
    role: 'superadmin', isEmailVerified: true, isActive: true,
  });

  const sellerNames = [
    ['Tech', 'Hub'], ['Fashion', 'Forward'], ['Home', 'Essentials'],
    ['Beauty', 'Box'], ['Sports', 'Pro'], ['Book', 'World'],
    ['Toy', 'Land'], ['Auto', 'Parts'], ['Green', 'Living'], ['Luxury', 'Goods'],
  ];

  const sellerUsers = [];
  for (const [first, last] of sellerNames) {
    const u = await User.create({
      firstName: first, lastName: last,
      email: `${slugify(first + last)}@seller.com`,
      password: hashedSellerPw,
      role: 'seller', isEmailVerified: true, isActive: true,
    });
    sellerUsers.push(u);
  }

  const firstNames = ['Alice','Bob','Carol','David','Emma','Frank','Grace','Henry','Iris','Jack','Kate','Liam','Mia','Noah','Olivia','Paul','Quinn','Rachel','Sam','Tara'];
  const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Moore'];
  const customers = [];
  for (let i = 0; i < 20; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const c = await User.create({
      firstName: fn, lastName: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
      password: hashedCustomerPw,
      role: 'customer', isEmailVerified: true, isActive: true,
      loyaltyPoints: rand(0, 3000),
      totalOrders: rand(0, 15),
      totalSpent: rand(0, 1500),
    });
    customers.push(c);
  }
  console.log(`  ✅ ${1 + sellerUsers.length + customers.length} users`);

  // ─── Sellers ──────────────────────────────────────────────────────────────
  console.log('Seeding seller profiles...');
  const storeNames = [
    'TechHub Store', 'Fashion Forward', 'Home Essentials Co',
    'Beauty Box', 'Sports Pro Shop', 'Book World', 'Toy Land',
    'Auto Parts Plus', 'Green Living', 'Luxury Goods',
  ];
  for (let i = 0; i < sellerUsers.length; i++) {
    await Seller.create({
      user: sellerUsers[i]._id,
      storeName: storeNames[i],
      storeSlug: slugify(storeNames[i]),
      description: `Premium ${storeNames[i]} — quality products at great prices.`,
      contactEmail: sellerUsers[i].email,
      isVerified: true,
      verificationStatus: 'approved',
      rating: { average: rand(38, 50) / 10, count: rand(20, 300) },
      totalSales: rand(50, 2000),
      totalRevenue: rand(5000, 200000),
    });
  }
  console.log(`  ✅ ${sellerUsers.length} seller profiles`);

  // ─── Categories ───────────────────────────────────────────────────────────
  console.log('Seeding categories...');
  const categoryData = [
    { name: 'Electronics', icon: '💻', subs: ['Smartphones', 'Laptops', 'Headphones', 'Cameras', 'Smart Home', 'Gaming'] },
    { name: 'Fashion', icon: '👗', subs: ["Men's Clothing", "Women's Clothing", 'Shoes', 'Accessories', 'Watches', 'Jewelry'] },
    { name: 'Home & Living', icon: '🏠', subs: ['Furniture', 'Kitchen', 'Bedding', 'Decor', 'Lighting', 'Storage'] },
    { name: 'Beauty & Health', icon: '✨', subs: ['Skincare', 'Makeup', 'Hair Care', 'Fragrances', 'Vitamins', 'Fitness'] },
    { name: 'Sports & Outdoors', icon: '⚽', subs: ['Exercise Equipment', 'Outdoor Gear', 'Team Sports', 'Cycling', 'Running', 'Water Sports'] },
    { name: 'Books & Media', icon: '📚', subs: ['Fiction', 'Non-Fiction', "Children's Books", 'Textbooks', 'Music', 'Movies'] },
    { name: 'Toys & Kids', icon: '🧸', subs: ['Action Figures', 'Board Games', 'Educational', 'Outdoor Play', 'Baby Toys', 'LEGO'] },
    { name: 'Automotive', icon: '🚗', subs: ['Car Accessories', 'Tools', 'Car Care', 'Electronics', 'Tires', 'Parts'] },
  ];

  const categories = [];
  const allSubcategories = [];
  for (const catData of categoryData) {
    const cat = await Category.create({
      name: catData.name, slug: slugify(catData.name),
      icon: catData.icon, isActive: true, isFeatured: true, level: 0,
    });
    categories.push(cat);
    for (const subName of catData.subs) {
      const sub = await Category.create({
        name: subName, slug: slugify(subName),
        parent: cat._id,
        ancestors: [{ _id: cat._id, name: cat.name, slug: cat.slug }],
        level: 1, isActive: true,
      });
      allSubcategories.push(sub);
    }
  }
  console.log(`  ✅ ${categories.length} categories + ${allSubcategories.length} subcategories`);

  // ─── Brands ───────────────────────────────────────────────────────────────
  console.log('Seeding brands...');
  const brandNames = [
    'Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'IKEA', 'Zara', 'H&M',
    'Dyson', 'Philips', 'Canon', 'Nikon', "Levi's", 'Puma', 'Under Armour',
    'New Balance', 'Converse', "L'Oreal", 'Maybelline', 'LEGO',
  ];
  const brands = [];
  for (const name of brandNames) {
    const b = await Brand.create({
      name, slug: slugify(name),
      isActive: true, isFeatured: Math.random() > 0.5, isVerified: true,
      logo: { url: img(`brand-${slugify(name)}`, 200, 200), alt: name },
    });
    brands.push(b);
  }
  console.log(`  ✅ ${brands.length} brands`);

  // ─── Products ─────────────────────────────────────────────────────────────
  console.log('Seeding products (100)...');
  const productTemplates = [
    { title: 'Wireless Noise-Cancelling Headphones Pro', basePrice: 299.99, salePrice: 249.99 },
    { title: '4K Ultra HD Smart TV 55-inch', basePrice: 799.99, salePrice: 649.99 },
    { title: 'Premium Running Shoes', basePrice: 129.99, salePrice: null },
    { title: 'Organic Cotton T-Shirt', basePrice: 39.99, salePrice: 29.99 },
    { title: 'Stainless Steel Water Bottle 32oz', basePrice: 34.99, salePrice: null },
    { title: 'Wireless Mechanical Keyboard', basePrice: 149.99, salePrice: 119.99 },
    { title: 'Yoga Mat Premium Non-Slip', basePrice: 59.99, salePrice: null },
    { title: 'Coffee Maker with Grinder', basePrice: 199.99, salePrice: 159.99 },
    { title: 'Leather Crossbody Bag', basePrice: 89.99, salePrice: null },
    { title: 'Vitamin C Serum 30ml', basePrice: 49.99, salePrice: 39.99 },
    { title: 'Bluetooth Speaker Waterproof', basePrice: 79.99, salePrice: null },
    { title: 'Denim Jacket Classic Fit', basePrice: 69.99, salePrice: 54.99 },
    { title: 'Air Fryer 5.8 Quart', basePrice: 119.99, salePrice: 89.99 },
    { title: 'Gaming Mouse RGB 16000 DPI', basePrice: 59.99, salePrice: null },
    { title: 'Scented Soy Candle Set', basePrice: 44.99, salePrice: null },
    { title: 'Resistance Bands Set 5-Pack', basePrice: 29.99, salePrice: 24.99 },
    { title: 'Silk Pillowcase Queen Size', basePrice: 39.99, salePrice: null },
    { title: 'Portable Charger 20000mAh', basePrice: 49.99, salePrice: 39.99 },
    { title: 'Cast Iron Skillet 12-inch', basePrice: 44.99, salePrice: null },
    { title: 'Sunglasses Polarized UV400', basePrice: 79.99, salePrice: 59.99 },
  ];

  const products = [];
  for (let i = 0; i < 100; i++) {
    const t = productTemplates[i % productTemplates.length];
    const category = pick(categories);
    const brand = pick(brands);
    const seller = pick(sellerUsers);
    const stock = rand(5, 150);
    const soldCount = rand(0, 300);
    const reviewCount = rand(0, 80);
    const avgRating = rand(32, 50) / 10;

    const product = await Product.create({
      title: i < 20 ? t.title : `${t.title} ${Math.floor(i / 20) + 1}`,
      slug: `${slugify(t.title)}-${i + 1}`,
      description: `<p>Premium quality ${t.title.toLowerCase()}. Crafted with the finest materials for exceptional performance and durability.</p><p>Features advanced technology, ergonomic design, and long-lasting build quality. Backed by our 30-day return policy.</p>`,
      shortDescription: `Premium ${t.title.toLowerCase()} with exceptional quality and performance.`,
      seller: seller._id,
      category: category._id,
      brand: brand._id,
      sku: `SKU-${String(i + 1).padStart(6, '0')}`,
      images: Array.from({ length: rand(2, 4) }, (_, j) => ({
        url: img(`product-${i}-${j}`, 600, 600),
        publicId: `nexus/products/product-${i}-${j}`,
        isPrimary: j === 0,
        alt: t.title,
        order: j,
      })),
      variants: [
        {
          name: 'Color',
          options: [
            { value: 'black', label: 'Black', colorHex: '#1a1a1a' },
            { value: 'white', label: 'White', colorHex: '#f5f5f5' },
            { value: 'navy', label: 'Navy', colorHex: '#1B2A4A' },
          ],
        },
        {
          name: 'Size',
          options: [
            { value: 's', label: 'S' },
            { value: 'm', label: 'M' },
            { value: 'l', label: 'L' },
            { value: 'xl', label: 'XL' },
          ],
        },
      ],
      specifications: [
        { key: 'Material', value: 'Premium Grade' },
        { key: 'Weight', value: `${rand(100, 2000)}g` },
        { key: 'Warranty', value: '1 Year' },
        { key: 'Country of Origin', value: 'USA' },
      ],
      tags: slugify(t.title).split('-').slice(0, 3),
      basePrice: t.basePrice,
      salePrice: t.salePrice,
      stock,
      status: 'active',
      isPublished: true,
      isFeatured: i < 20 && Math.random() > 0.5,
      isTrending: i < 30 && Math.random() > 0.6,
      isNewArrival: i < 40 && Math.random() > 0.5,
      ratings: {
        average: avgRating,
        count: reviewCount,
        distribution: { 1: rand(0, 3), 2: rand(0, 5), 3: rand(3, 15), 4: rand(8, 30), 5: rand(15, 50) },
      },
      reviewCount,
      soldCount,
      viewCount: rand(100, 8000),
      wishlistCount: rand(0, 300),
    });

    await Inventory.create({
      product: product._id,
      seller: seller._id,
      variantKey: 'default',
      variantLabel: 'Default',
      sku: product.sku,
      stock,
      soldStock: rand(0, 200),
      lowStockThreshold: 5,
    });

    products.push(product);
  }
  console.log(`  ✅ ${products.length} products`);

  // ─── Coupons ──────────────────────────────────────────────────────────────
  console.log('Seeding coupons...');
  const coupons = [
    { code: 'WELCOME10', type: 'percentage', value: 10, description: '10% off for new customers', isFirstTimeOnly: true },
    { code: 'SUMMER20', type: 'percentage', value: 20, description: 'Summer sale 20% off', maxDiscountAmount: 50 },
    { code: 'FREESHIP', type: 'free_shipping', value: 0, description: 'Free shipping on any order' },
    { code: 'NEXUS50', type: 'fixed_amount', value: 50, description: '$50 off orders over $200', minOrderAmount: 200 },
    { code: 'NEWUSER', type: 'percentage', value: 15, description: '15% off for new users', isFirstTimeOnly: true },
  ];
  for (const c of coupons) {
    await Coupon.create({
      ...c,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
      totalUsageLimit: 1000,
      usageLimitPerUser: 1,
      createdBy: superadmin._id,
    });
  }
  console.log(`  ✅ ${coupons.length} coupons`);

  // ─── Banners ──────────────────────────────────────────────────────────────
  console.log('Seeding banners...');
  await Banner.create([
    { title: 'Summer Sale', subtitle: 'Up to 50% off', position: 'hero', order: 1, image: { url: img('banner-1', 1200, 500), alt: 'Summer Sale' }, link: '/deals', buttonText: 'Shop Now', isActive: true, createdBy: superadmin._id },
    { title: 'New Arrivals', subtitle: 'Fresh drops every week', position: 'hero', order: 2, image: { url: img('banner-2', 1200, 500), alt: 'New Arrivals' }, link: '/new-arrivals', buttonText: 'Explore', isActive: true, createdBy: superadmin._id },
    { title: 'Free Shipping', subtitle: 'On orders over $75', position: 'homepage_top', order: 1, image: { url: img('banner-3', 800, 300), alt: 'Free Shipping' }, link: '/shop', isActive: true, createdBy: superadmin._id },
  ]);
  console.log('  ✅ 3 banners');

  // ─── Flash Deals ──────────────────────────────────────────────────────────
  console.log('Seeding flash deals...');
  for (let i = 0; i < 3; i++) {
    const product = products[i];
    const dealPrice = product.basePrice * 0.6;
    await FlashDeal.create({
      title: `Flash Deal: ${product.title}`,
      product: product._id,
      seller: product.seller,
      originalPrice: product.basePrice,
      dealPrice,
      discountPercentage: 40,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      totalStock: 50,
      soldCount: rand(10, 40),
      isActive: true,
      status: 'active',
      createdBy: superadmin._id,
    });
    await Product.findByIdAndUpdate(product._id, {
      isFlashDeal: true,
      flashDealPrice: dealPrice,
      flashDealExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }
  console.log('  ✅ 3 flash deals');

  // ─── Orders ───────────────────────────────────────────────────────────────
  console.log('Seeding orders...');
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  for (let i = 0; i < 50; i++) {
    const customer = pick(customers);
    const orderProducts = [pick(products), pick(products)].filter((p, idx, arr) => arr.findIndex(x => x._id.equals(p._id)) === idx);
    const items = orderProducts.map(p => ({
      product: p._id, seller: p.seller,
      variantKey: 'default', variantLabel: '',
      quantity: rand(1, 3), price: p.basePrice,
      title: p.title, image: p.images?.[0]?.url, status: 'delivered',
    }));
    const subtotal = items.reduce((s, item) => s + item.price * item.quantity, 0);
    const orderStatus = pick(statuses);
    await Order.create({
      orderNumber: `NX-2024-${String(i + 1).padStart(6, '0')}`,
      user: customer._id,
      items,
      shippingAddress: {
        firstName: customer.firstName, lastName: customer.lastName,
        phone: '+1-555-0100', addressLine1: `${rand(100, 9999)} Main St`,
        city: 'San Francisco', state: 'CA', postalCode: '94105', country: 'US',
      },
      paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
      paymentStatus: orderStatus === 'cancelled' ? 'failed' : 'captured',
      orderStatus,
      subtotal,
      shippingCost: subtotal > 75 ? 0 : 9.99,
      taxAmount: subtotal * 0.08,
      totalAmount: subtotal + (subtotal > 75 ? 0 : 9.99) + subtotal * 0.08,
      currency: 'USD',
      timeline: [{ status: orderStatus, message: `Order ${orderStatus}`, actor: 'system' }],
      deliveredAt: orderStatus === 'delivered' ? new Date(Date.now() - rand(1, 30) * 24 * 60 * 60 * 1000) : null,
    });
  }
  console.log('  ✅ 50 orders');

  console.log('\n✅ SEED COMPLETE!\n');
  console.log('─────────────────────────────────────────────────────');
  console.log('  Admin:    superadmin@nexuscommerce.com / Admin@123!');
  console.log('  Seller:   techubforward@seller.com / Seller@123!');
  console.log('  Customer: alice.smith0@example.com / Customer@123!');
  console.log('─────────────────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
