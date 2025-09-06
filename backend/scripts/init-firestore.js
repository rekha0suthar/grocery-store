import { db } from '../src/config/firebase.js';
import bcrypt from 'bcryptjs';

/**
 * Initialize Firestore with sample data
 * This script creates the initial collections and data for the grocery store
 */
async function initializeFirestore() {
  try {
    console.log('🔥 Initializing Firestore database...');

    // Create default admin user
    const adminPassword = 'admin123';
    const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = {
      email: 'admin@grocery.com',
      name: 'Admin User',
      password_hash: adminPasswordHash,
      role: 'admin',
      phone: '+1234567890',
      address: '123 Admin Street, Admin City',
      is_email_verified: true,
      is_phone_verified: true,
      last_login_at: null,
      login_attempts: 0,
      locked_until: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add admin user
    const adminRef = await db.collection('users').add(adminUser);
    console.log('✅ Admin user created with ID:', adminRef.id);

    // Create default categories
    const categories = [
      {
        name: 'Fruits & Vegetables',
        description: 'Fresh fruits and vegetables',
        slug: 'fruits-vegetables',
        image_url: null,
        parent_id: null,
        sort_order: 1,
        is_visible: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Dairy & Eggs',
        description: 'Milk, cheese, eggs and dairy products',
        slug: 'dairy-eggs',
        image_url: null,
        parent_id: null,
        sort_order: 2,
        is_visible: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Meat & Seafood',
        description: 'Fresh meat, poultry and seafood',
        slug: 'meat-seafood',
        image_url: null,
        parent_id: null,
        sort_order: 3,
        is_visible: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Bakery',
        description: 'Bread, pastries and baked goods',
        slug: 'bakery',
        image_url: null,
        parent_id: null,
        sort_order: 4,
        is_visible: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Pantry',
        description: 'Canned goods, spices and pantry items',
        slug: 'pantry',
        image_url: null,
        parent_id: null,
        sort_order: 5,
        is_visible: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Add categories
    const categoryRefs = [];
    for (const category of categories) {
      const categoryRef = await db.collection('categories').add(category);
      categoryRefs.push(categoryRef);
      console.log('✅ Category created:', category.name);
    }

    // Create sample products
    const products = [
      {
        name: 'Fresh Apples',
        description: 'Crisp and sweet red apples',
        price: 2.99,
        category_id: categoryRefs[0].id, // Fruits & Vegetables
        sku: 'FRUIT-APPLE-001',
        barcode: '1234567890123',
        unit: 'lb',
        weight: 1.0,
        dimensions: { length: 3, width: 3, height: 3 },
        stock: 50,
        min_stock: 10,
        max_stock: 100,
        images: [],
        tags: ['fruit', 'apple', 'fresh', 'healthy'],
        is_visible: true,
        is_featured: true,
        discount_price: null,
        discount_start_date: null,
        discount_end_date: null,
        nutrition_info: { calories: 52, protein: 0.3, carbs: 14 },
        allergens: [],
        expiry_date: null,
        manufacturer: 'Fresh Farms',
        country_of_origin: 'USA',
        added_by: adminRef.id,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: 'Organic Milk',
        description: 'Fresh organic whole milk',
        price: 4.99,
        category_id: categoryRefs[1].id, // Dairy & Eggs
        sku: 'DAIRY-MILK-001',
        barcode: '1234567890124',
        unit: 'gallon',
        weight: 8.6,
        dimensions: { length: 6, width: 6, height: 10 },
        stock: 25,
        min_stock: 5,
        max_stock: 50,
        images: [],
        tags: ['dairy', 'milk', 'organic', 'fresh'],
        is_visible: true,
        is_featured: false,
        discount_price: 3.99,
        discount_start_date: new Date().toISOString(),
        discount_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        nutrition_info: { calories: 150, protein: 8, carbs: 12 },
        allergens: ['lactose'],
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        manufacturer: 'Organic Valley',
        country_of_origin: 'USA',
        added_by: adminRef.id,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Add products
    for (const product of products) {
      const productRef = await db.collection('products').add(product);
      console.log('✅ Product created:', product.name);
    }

    console.log('🎉 Firestore initialization completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('- Admin user: admin@grocery.com / admin123');
    console.log('- Categories: 5 created');
    console.log('- Products: 2 created');
    console.log('');
    console.log('🚀 You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    process.exit(1);
  }
}

// Run initialization
initializeFirestore();
