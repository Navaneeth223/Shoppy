"use strict";

/**
 * NEXUS COMMERCE — DATABASE SEED SCRIPT
 * Populates the database with realistic test data.
 * Run: node infrastructure/scripts/seed.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../server/.env") });

// ─── Models ───────────────────────────────────────────────────────────────────
const User = require("../../server/src/models/User.model");
const Seller = require("../../server/src/models/Seller.model");
const Category = require("../../server/src/models/Category.model");
const Brand = require("../../server/src/models/Brand.model");
const Product = require("../../server/src/models/Product.model");
const Inventory = require("../../server/src/models/Inventory.model");
const Order = require("../../server/src/models/Order.model");
const Review = require("../../server/src/models/Review.model");
const Coupon = require("../../server/src/models/Coupon.model");
const Banner = require("../../server/src/models/Banner.model");
const FlashDeal = require("../../server/src/models/FlashDeal.model");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/nexus_commerce";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const slug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const img = (seed, w = 400, h = 400) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const REVIEW_BODIES = [
  "Absolutely love this product! Exceeded my expectations in every way.",
  "Great quality for the price. Would definitely recommend to friends.",
  "Fast shipping and well packaged. Product works exactly as described.",
  "Good product overall. Minor issues but nothing deal-breaking.",
  "Outstanding quality! This is my second purchase and still impressed.",
  "Decent product. Does what it says on the tin.",
  "Excellent build quality. Feels premium and well-made.",
  "Very happy with this purchase. Will buy again.",
  "Product arrived quickly and in perfect condition.",
  "Solid product. Good value for money.",
];

// ─── Seed Functions ───────────────────────────────────────────────────────────

async function seedUsers() {
  console.log("Seeding users...");
  const users = [];

  // Superadmin
  const superadmin = await User.create({
    firstName: "Super", lastName: "Admin",
    email: "superadmin@nexuscommerce.com",
    password: await bcrypt.hash("Admin@123!", 12),
    role: "superadmin", isEmailVerified: true, isActive: true,
  });
  users.push(superadmin);

  // Admins
  for (let i = 1; i <= 5; i++) {
    const admin = await User.create({
      firstName: `Admin${i}`, lastName: "User",
      email: `admin${i}@nexuscommerce.com`,
      password: await bcrypt.hash("Admin@123!", 12),
      role: "admin", isEmailVerified: true, isActive: true,
    });
    users.push(admin);
  }

  // Sellers
  const sellerNames = [
    ["Tech", "Hub"], ["Fashion", "Forward"], ["Home", "Essentials"],
    ["Beauty", "Box"], ["Sports", "Pro"], ["Book", "World"],
    ["Toy", "Land"], ["Auto", "Parts"], ["Green", "Living"], ["Luxury", "Goods"],
  ];
  const sellerUsers = [];
  for (const [first, last] of sellerNames) {
    const seller = await User.create({
      firstName: first, lastName: last,
      email: `${slug(first + last)}@seller.com`,
      password: await bcrypt.hash("Seller@123!", 12),
      role: "seller", isEmailVerified: true, isActive: true,
    });
    sellerUsers.push(seller);
    users.push(seller);
  }

  // Customers
  const firstNames = ["Alice","Bob","Carol","David","Emma","Frank","Grace","Henry","Iris","Jack","Kate","Liam","Mia","Noah","Olivia","Paul","Quinn","Rachel","Sam","Tara","Uma","Victor","Wendy","Xavier","Yara","Zoe","Alex","Blake","Casey","Drew"];
  const lastNames = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Wilson","Moore","Taylor","Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Young","Lee"];
  for (let i = 0; i < 50; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const customer = await User.create({
      firstName: fn, lastName: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
      password: await bcrypt.hash("Customer@123!", 12),
      role: "customer", isEmailVerified: true, isActive: true,
      loyaltyPoints: rand(0, 5000),
      totalOrders: rand(0, 20),
      totalSpent: rand(0, 2000),
    });
    users.push(customer);
  }

  console.log(`  Created ${users.length} users`);
  return { superadmin, sellerUsers, customers: users.filter((u) => u.role === "customer") };
}

async function seedSellers(sellerUsers, adminId) {
  console.log("Seeding seller profiles...");
  const sellers = [];
  const storeNames = [
    "TechHub Store", "Fashion Forward", "Home Essentials Co",
    "Beauty Box", "Sports Pro Shop", "Book World", "Toy Land",
    "Auto Parts Plus", "Green Living", "Luxury Goods",
  ];

  for (let i = 0; i < sellerUsers.length; i++) {
    const seller = await Seller.create({
      user: sellerUsers[i]._id,
      storeName: storeNames[i],
      storeSlug: slug(storeNames[i]),
      description: `Premium ${storeNames[i]} — quality products at great prices.`,
      contactEmail: sellerUsers[i].email,
      contactPhone: `+1-555-${String(rand(1000000, 9999999))}`,
      isVerified: true,
      verificationStatus: "approved",
      rating: { average: (rand(35, 50) / 10), count: rand(10, 500) },
      totalSales: rand(50, 5000),
      totalRevenue: rand(5000, 500000),
      commissionRate: 0.1,
    });
    sellers.push(seller);
  }

  console.log(`  Created ${sellers.length} seller profiles`);
  return sellers;
}

async function seedCategories(adminId) {
  console.log("Seeding categories...");
  const categoryData = [
    {
      name: "Electronics", icon: "💻", subcategories: [
        "Smartphones", "Laptops", "Headphones", "Cameras", "Smart Home", "Gaming",
      ],
    },
    {
      name: "Fashion", icon: "👗", subcategories: [
        "Men's Clothing", "Women's Clothing", "Shoes", "Accessories", "Watches", "Jewelry",
      ],
    },
    {
      name: "Home & Living", icon: "🏠", subcategories: [
        "Furniture", "Kitchen", "Bedding", "Decor", "Lighting", "Storage",
      ],
    },
    {
      name: "Beauty & Health", icon: "✨", subcategories: [
        "Skincare", "Makeup", "Hair Care", "Fragrances", "Vitamins", "Fitness",
      ],
    },
    {
      name: "Sports & Outdoors", icon: "⚽", subcategories: [
        "Exercise Equipment", "Outdoor Gear", "Team Sports", "Water Sports", "Cycling", "Running",
      ],
    },
    {
      name: "Books & Media", icon: "📚", subcategories: [
        "Fiction", "Non-Fiction", "Children's Books", "Textbooks", "Music", "Movies",
      ],
    },
    {
      name: "Toys & Kids", icon: "🧸", subcategories: [
        "Action Figures", "Board Games", "Educational", "Outdoor Play", "Baby Toys", "LEGO",
      ],
    },
    {
      name: "Automotive", icon: "🚗", subcategories: [
        "Car Accessories", "Tools", "Car Care", "Electronics", "Tires", "Parts",
      ],
    },
  ];

  const categories = [];
  const subcategoryMap = {};

  for (const catData of categoryData) {
    const cat = await Category.create({
      name: catData.name,
      slug: slug(catData.name),
      icon: catData.icon,
      isActive: true,
      isFeatured: true,
      level: 0,
    });
    categories.push(cat);

    for (const subName of catData.subcategories) {
      const sub = await Category.create({
        name: subName,
        slug: slug(subName),
        parent: cat._id,
        ancestors: [{ _id: cat._id, name: cat.name, slug: cat.slug }],
        level: 1,
        isActive: true,
      });
      if (!subcategoryMap[cat._id.toString()]) subcategoryMap[cat._id.toString()] = [];
      subcategoryMap[cat._id.toString()].push(sub);
    }
  }

  console.log(`  Created ${categories.length} categories with subcategories`);
  return { categories, subcategoryMap };
}

async function seedBrands(categories) {
  console.log("Seeding brands...");
  const brandNames = [
    "Apple", "Samsung", "Sony", "Nike", "Adidas", "IKEA", "Zara", "H&M",
    "Dyson", "Philips", "Bosch", "Canon", "Nikon", "Levi's", "Puma",
    "Under Armour", "Reebok", "New Balance", "Converse", "Vans",
    "L'Oreal", "Maybelline", "MAC", "Clinique", "Estee Lauder",
    "Penguin Books", "HarperCollins", "Random House", "LEGO", "Hasbro",
  ];

  const brands = [];
  for (const name of brandNames) {
    const brand = await Brand.create({
      name,
      slug: slug(name),
      isActive: true,
      isFeatured: Math.random() > 0.5,
      isVerified: true,
      logo: { url: img(`brand-${slug(name)}`, 200, 200), alt: name },
    });
    brands.push(brand);
  }

  console.log(`  Created ${brands.length} brands`);
  return brands;
}

async function seedProducts(categories, brands, sellerUsers) {
  console.log("Seeding products...");
  const products = [];

  const productTemplates = [
    { title: "Wireless Noise-Cancelling Headphones Pro", basePrice: 299.99, salePrice: 249.99 },
    { title: "4K Ultra HD Smart TV 55-inch", basePrice: 799.99, salePrice: 649.99 },
    { title: "Premium Running Shoes", basePrice: 129.99, salePrice: null },
    { title: "Organic Cotton T-Shirt", basePrice: 39.99, salePrice: 29.99 },
    { title: "Stainless Steel Water Bottle 32oz", basePrice: 34.99, salePrice: null },
    { title: "Wireless Mechanical Keyboard", basePrice: 149.99, salePrice: 119.99 },
    { title: "Yoga Mat Premium Non-Slip", basePrice: 59.99, salePrice: null },
    { title: "Coffee Maker with Grinder", basePrice: 199.99, salePrice: 159.99 },
    { title: "Leather Crossbody Bag", basePrice: 89.99, salePrice: null },
    { title: "Vitamin C Serum 30ml", basePrice: 49.99, salePrice: 39.99 },
    { title: "Bluetooth Speaker Waterproof", basePrice: 79.99, salePrice: null },
    { title: "Denim Jacket Classic Fit", basePrice: 69.99, salePrice: 54.99 },
    { title: "Air Fryer 5.8 Quart", basePrice: 119.99, salePrice: 89.99 },
    { title: "Gaming Mouse RGB 16000 DPI", basePrice: 59.99, salePrice: null },
    { title: "Scented Soy Candle Set", basePrice: 44.99, salePrice: null },
    { title: "Resistance Bands Set 5-Pack", basePrice: 29.99, salePrice: 24.99 },
    { title: "Silk Pillowcase Queen Size", basePrice: 39.99, salePrice: null },
    { title: "Portable Charger 20000mAh", basePrice: 49.99, salePrice: 39.99 },
    { title: "Cast Iron Skillet 12-inch", basePrice: 44.99, salePrice: null },
    { title: "Sunglasses Polarized UV400", basePrice: 79.99, salePrice: 59.99 },
  ];

  for (let i = 0; i < 200; i++) {
    const template = productTemplates[i % productTemplates.length];
    const category = pick(categories);
    const brand = pick(brands);
    const seller = pick(sellerUsers);
    const stock = rand(0, 200);
    const soldCount = rand(0, 500);
    const reviewCount = rand(0, 100);
    const avgRating = rand(30, 50) / 10;

    const product = await Product.create({
      title: `${template.title} ${i > 19 ? `v${Math.floor(i / 20) + 1}` : ""}`.trim(),
      slug: `${slug(template.title)}-${i + 1}`,
      description: `<p>Premium quality ${template.title.toLowerCase()}. Crafted with the finest materials for exceptional performance and durability. Perfect for everyday use.</p><p>Features include advanced technology, ergonomic design, and long-lasting build quality. Backed by our 30-day return policy.</p>`,
      shortDescription: `Premium ${template.title.toLowerCase()} with exceptional quality and performance.`,
      seller: seller._id,
      category: category._id,
      brand: brand._id,
      sku: `SKU-${String(i + 1).padStart(6, "0")}`,
      images: Array.from({ length: rand(2, 5) }, (_, j) => ({
        url: img(`product-${i}-${j}`, 600, 600),
        publicId: `nexus/products/product-${i}-${j}`,
        isPrimary: j === 0,
        alt: template.title,
        order: j,
      })),
      variants: [
        {
          name: "Color",
          options: [
            { value: "black", label: "Black", colorHex: "#000000" },
            { value: "white", label: "White", colorHex: "#FFFFFF" },
            { value: "navy", label: "Navy", colorHex: "#1B2A4A" },
          ],
        },
        {
          name: "Size",
          options: [
            { value: "s", label: "S" },
            { value: "m", label: "M" },
            { value: "l", label: "L" },
            { value: "xl", label: "XL" },
          ],
        },
      ],
      specifications: [
        { key: "Material", value: "Premium Grade" },
        { key: "Weight", value: `${rand(100, 2000)}g` },
        { key: "Dimensions", value: `${rand(10, 50)} x ${rand(10, 50)} x ${rand(5, 20)} cm` },
        { key: "Warranty", value: "1 Year" },
        { key: "Country of Origin", value: "USA" },
      ],
      tags: [slug(template.title).split("-").slice(0, 3)].flat(),
      basePrice: template.basePrice,
      salePrice: template.salePrice,
      stock,
      status: "active",
      isPublished: true,
      isFeatured: Math.random() > 0.7,
      isTrending: Math.random() > 0.75,
      isNewArrival: Math.random() > 0.6,
      ratings: {
        average: avgRating,
        count: reviewCount,
        distribution: { 1: rand(0, 5), 2: rand(0, 10), 3: rand(5, 20), 4: rand(10, 40), 5: rand(20, 60) },
      },
      reviewCount,
      soldCount,
      viewCount: rand(100, 10000),
      wishlistCount: rand(0, 500),
    });

    // Create inventory
    await Inventory.create({
      product: product._id,
      seller: seller._id,
      variantKey: "default",
      variantLabel: "Default",
      sku: product.sku,
      stock,
      soldStock,
      lowStockThreshold: 5,
    });

    products.push(product);
  }

  console.log(`  Created ${products.length} products`);
  return products;
}

async function seedCoupons(adminId) {
  console.log("Seeding coupons...");
  const coupons = [
    { code: "WELCOME10", type: "percentage", value: 10, description: "10% off for new customers", isFirstTimeOnly: true },
    { code: "SUMMER20", type: "percentage", value: 20, description: "Summer sale 20% off", maxDiscountAmount: 50 },
    { code: "FREESHIP", type: "free_shipping", value: 0, description: "Free shipping on any order" },
    { code: "NEXUS50", type: "fixed_amount", value: 50, description: "$50 off orders over $200", minOrderAmount: 200 },
    { code: "NEWUSER", type: "percentage", value: 15, description: "15% off for new users", isFirstTimeOnly: true },
  ];

  const created = [];
  for (const coupon of coupons) {
    const c = await Coupon.create({
      ...coupon,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
      totalUsageLimit: 1000,
      usageLimitPerUser: 1,
      createdBy: adminId,
    });
    created.push(c);
  }

  console.log(`  Created ${created.length} coupons`);
  return created;
}

async function seedBanners(adminId) {
  console.log("Seeding banners...");
  const banners = [
    { title: "Summer Sale", subtitle: "Up to 50% off", position: "hero", order: 1 },
    { title: "New Arrivals", subtitle: "Fresh drops every week", position: "hero", order: 2 },
    { title: "Free Shipping", subtitle: "On orders over $75", position: "homepage_top", order: 1 },
  ];

  for (const banner of banners) {
    await Banner.create({
      ...banner,
      image: { url: img(`banner-${banner.order}`, 1200, 400), alt: banner.title },
      link: "/shop",
      buttonText: "Shop Now",
      isActive: true,
      createdBy: adminId,
    });
  }

  console.log(`  Created ${banners.length} banners`);
}

async function seedFlashDeals(products, sellerUsers, adminId) {
  console.log("Seeding flash deals...");
  const dealProducts = products.slice(0, 3);

  for (const product of dealProducts) {
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
      status: "active",
      createdBy: adminId,
    });

    await Product.findByIdAndUpdate(product._id, {
      isFlashDeal: true,
      flashDealPrice: dealPrice,
      flashDealExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  console.log(`  Created ${dealProducts.length} flash deals`);
}

async function seedOrders(customers, products, adminId) {
  console.log("Seeding orders...");
  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
  const orders = [];

  for (let i = 0; i < 100; i++) {
    const customer = pick(customers);
    const orderProducts = [pick(products), pick(products)].filter((p, idx, arr) => arr.findIndex((x) => x._id.equals(p._id)) === idx);
    const items = orderProducts.map((p) => ({
      product: p._id,
      seller: p.seller,
      variantKey: "default",
      variantLabel: "",
      quantity: rand(1, 3),
      price: p.effectivePrice || p.basePrice,
      title: p.title,
      image: p.images?.[0]?.url,
      status: "delivered",
    }));

    const subtotal = items.reduce((s, item) => s + item.price * item.quantity, 0);
    const orderStatus = pick(statuses);
    const orderNumber = `NX-2024-${String(i + 1).padStart(6, "0")}`;

    const order = await Order.create({
      orderNumber,
      user: customer._id,
      items,
      shippingAddress: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: "+1-555-0100",
        addressLine1: `${rand(100, 9999)} Main St`,
        city: "San Francisco",
        state: "CA",
        postalCode: "94105",
        country: "US",
      },
      paymentMethod: { type: "card", last4: "4242", brand: "visa" },
      paymentStatus: orderStatus === "cancelled" ? "failed" : "captured",
      orderStatus,
      subtotal,
      shippingCost: subtotal > 75 ? 0 : 9.99,
      taxAmount: subtotal * 0.08,
      totalAmount: subtotal + (subtotal > 75 ? 0 : 9.99) + subtotal * 0.08,
      currency: "USD",
      timeline: [{ status: orderStatus, message: `Order ${orderStatus}`, actor: "system" }],
      deliveredAt: orderStatus === "delivered" ? new Date(Date.now() - rand(1, 30) * 24 * 60 * 60 * 1000) : null,
    });

    orders.push(order);
  }

  console.log(`  Created ${orders.length} orders`);
  return orders;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 NEXUS COMMERCE — DATABASE SEED\n");
  console.log(`Connecting to: ${MONGODB_URI}\n`);

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  // Clear existing data
  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}), Seller.deleteMany({}), Category.deleteMany({}),
    Brand.deleteMany({}), Product.deleteMany({}), Inventory.deleteMany({}),
    Order.deleteMany({}), Review.deleteMany({}), Coupon.deleteMany({}),
    Banner.deleteMany({}), FlashDeal.deleteMany({}),
  ]);
  console.log("✅ Cleared\n");

  const { superadmin, sellerUsers, customers } = await seedUsers();
  await seedSellers(sellerUsers, superadmin._id);
  const { categories } = await seedCategories(superadmin._id);
  const brands = await seedBrands(categories);
  const products = await seedProducts(categories, brands, sellerUsers);
  await seedCoupons(superadmin._id);
  await seedBanners(superadmin._id);
  await seedFlashDeals(products, sellerUsers, superadmin._id);
  await seedOrders(customers, products, superadmin._id);

  console.log("\n✅ SEED COMPLETE!\n");
  console.log("─────────────────────────────────────────");
  console.log("Admin login:    superadmin@nexuscommerce.com / Admin@123!");
  console.log("Seller login:   techub@seller.com / Seller@123!");
  console.log("Customer login: alice.smith0@example.com / Customer@123!");
  console.log("─────────────────────────────────────────\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
