import { db } from '../src/config/firebase.js';
import { Product } from '@grocery-store/core/entities';

async function populateProducts() {
  try {
    console.log('🛒 Starting product population...');

    // First, get existing categories
    const categoriesSnapshot = await db.collection('categories').get();
    const categories = {};
    
    categoriesSnapshot.forEach(doc => {
      categories[doc.data().name] = doc.id;
    });

    console.log('📂 Found categories:', Object.keys(categories));

    // Get admin user ID
    const adminSnapshot = await db.collection('users').where('role', '==', 'admin').limit(1).get();
    const adminId = adminSnapshot.empty ? null : adminSnapshot.docs[0].id;
    
    if (!adminId) {
      console.error('❌ No admin user found. Please run init-firestore.js first.');
      process.exit(1);
    }

    const products = [
      // Fruits & Vegetables
      {
        name: 'Fresh Red Apples',
        description: 'Crisp and sweet red apples, perfect for snacking or baking',
        price: 2.99,
        categoryId: categories['Fruits & Vegetables'],
        sku: 'FRUIT-APPLE-RED-001',
        barcode: '1234567890001',
        unit: 'lb',
        weight: 1.0,
        dimensions: { length: 3, width: 3, height: 3 },
        stock: 50,
        minStock: 10,
        maxStock: 100,
        images: ['https://picsum.photos/400/300?random=1'],
        tags: ['fruit', 'apple', 'fresh', 'healthy', 'organic'],
        isVisible: true,
        isFeatured: true,
        discountPrice: null,
        discountStartDate: null,
        discountEndDate: null,
        nutritionInfo: { calories: 52, protein: 0.3, carbs: 14, fiber: 2.4 },
        allergens: [],
        expiryDate: null,
        manufacturer: 'Fresh Valley Farms',
        countryOfOrigin: 'USA',
        addedBy: adminId
      },
      {
        name: 'Organic Bananas',
        description: 'Sweet and creamy organic bananas, rich in potassium',
        price: 1.99,
        categoryId: categories['Fruits & Vegetables'],
        sku: 'FRUIT-BANANA-ORG-001',
        barcode: '1234567890002',
        unit: 'bunch',
        weight: 1.5,
        dimensions: { length: 8, width: 4, height: 2 },
        stock: 30,
        minStock: 5,
        maxStock: 60,
        images: ['https://picsum.photos/400/300?random=2'],
        tags: ['fruit', 'banana', 'organic', 'healthy', 'potassium'],
        isVisible: true,
        isFeatured: true,
        discountPrice: 1.49,
        discountStartDate: new Date().toISOString(),
        discountEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        nutritionInfo: { calories: 89, protein: 1.1, carbs: 23, fiber: 2.6 },
        allergens: [],
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        manufacturer: 'Tropical Organics',
        countryOfOrigin: 'Ecuador',
        addedBy: adminId
      },
      {
        name: 'Fresh Carrots',
        description: 'Crunchy and sweet fresh carrots, great for cooking or snacking',
        price: 1.49,
        categoryId: categories['Fruits & Vegetables'],
        sku: 'VEG-CARROT-FRESH-001',
        barcode: '1234567890003',
        unit: 'lb',
        weight: 1.0,
        dimensions: { length: 6, width: 1, height: 1 },
        stock: 40,
        minStock: 8,
        maxStock: 80,
        images: ['https://picsum.photos/400/300?random=3'],
        tags: ['vegetable', 'carrot', 'fresh', 'healthy', 'vitamin-a'],
        isVisible: true,
        isFeatured: false,
        discountPrice: null,
        discountStartDate: null,
        discountEndDate: null,
        nutritionInfo: { calories: 41, protein: 0.9, carbs: 10, fiber: 2.8 },
        allergens: [],
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        manufacturer: 'Garden Fresh Co.',
        countryOfOrigin: 'USA',
        addedBy: adminId
      },

      // Dairy & Eggs
      {
        name: 'Organic Whole Milk',
        description: 'Fresh organic whole milk from grass-fed cows',
        price: 4.99,
        categoryId: categories['Dairy & Eggs'],
        sku: 'DAIRY-MILK-ORG-001',
        barcode: '1234567890004',
        unit: 'gallon',
        weight: 8.6,
        dimensions: { length: 6, width: 6, height: 10 },
        stock: 25,
        minStock: 5,
        maxStock: 50,
        images: ['https://picsum.photos/400/300?random=4'],
        tags: ['dairy', 'milk', 'organic', 'fresh', 'calcium'],
        isVisible: true,
        isFeatured: true,
        discountPrice: 3.99,
        discountStartDate: new Date().toISOString(),
        discountEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        nutritionInfo: { calories: 150, protein: 8, carbs: 12, fat: 8 },
        allergens: ['lactose'],
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        manufacturer: 'Organic Valley',
        countryOfOrigin: 'USA',
        addedBy: adminId
      },
      {
        name: 'Free-Range Eggs',
        description: 'Fresh free-range eggs from happy hens',
        price: 3.99,
        categoryId: categories['Dairy & Eggs'],
        sku: 'DAIRY-EGGS-FREE-001',
        barcode: '1234567890005',
        unit: 'dozen',
        weight: 1.5,
        dimensions: { length: 6, width: 6, height: 3 },
        stock: 20,
        minStock: 4,
        maxStock: 40,
        images: ['https://picsum.photos/400/300?random=5'],
        tags: ['dairy', 'eggs', 'free-range', 'fresh', 'protein'],
        isVisible: true,
        isFeatured: false,
        discountPrice: null,
        discountStartDate: null,
        discountEndDate: null,
        nutritionInfo: { calories: 70, protein: 6, carbs: 0.6, fat: 5 },
        allergens: ['eggs'],
        expiryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        manufacturer: 'Happy Hen Farms',
        countryOfOrigin: 'USA',
        addedBy: adminId
      },
      {
        name: 'Greek Yogurt',
        description: 'Creamy Greek yogurt with live cultures',
        price: 2.49,
        categoryId: categories['Dairy & Eggs'],
        sku: 'DAIRY-YOGURT-GREEK-001',
        barcode: '1234567890006',
        unit: 'container',
        weight: 0.5,
        dimensions: { length: 3, width: 3, height: 2 },
        stock: 35,
        minStock: 7,
        maxStock: 70,
        images: ['https://picsum.photos/400/300?random=6'],
        tags: ['dairy', 'yogurt', 'greek', 'probiotics', 'protein'],
        isVisible: true,
        isFeatured: true,
        discountPrice: 1.99,
        discountStartDate: new Date().toISOString(),
        discountEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        nutritionInfo: { calories: 100, protein: 10, carbs: 6, fat: 0 },
        allergens: ['lactose'],
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        manufacturer: 'Greek Gods',
        countryOfOrigin: 'USA',
        addedBy: adminId
      },

      // Meat & Seafood
      {
        name: 'Grass-Fed Ground Beef',
        description: 'Premium grass-fed ground beef, perfect for burgers',
        price: 8.99,
        categoryId: categories['Meat & Seafood'],
        sku: 'MEAT-BEEF-GROUND-001',
        barcode: '1234567890007',
        unit: 'lb',
        weight: 1.0,
        dimensions: { length: 6, width: 4, height: 1 },
        stock: 15,
        minStock: 3,
        maxStock: 30,
        images: ['https://picsum.photos/400/300?random=7'],
        tags: ['meat', 'beef', 'grass-fed', 'ground', 'protein'],
        isVisible: true,
        isFeatured: true,
        discountPrice: null,
        discountStartDate: null,
        discountEndDate: null,
        nutritionInfo: { calories: 250, protein: 26, carbs: 0, fat: 17 },
        allergens: [],
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        manufacturer: 'Premium Meats Co.',
        countryOfOrigin: 'USA',
        addedBy: adminId
      },
      {
        name: 'Fresh Salmon Fillet',
        description: 'Fresh Atlantic salmon fillet, perfect for grilling',
        price: 12.99,
        categoryId: categories['Meat & Seafood'],
        sku: 'SEAFOOD-SALMON-FRESH-001',
        barcode: '1234567890008',
        unit: 'lb',
        weight: 1.0,
        dimensions: { length: 8, width: 3, height: 1 },
        stock: 10,
        minStock: 2,
        maxStock: 20,
        images: ['https://picsum.photos/400/300?random=8'],
        tags: ['seafood', 'salmon', 'fresh', 'omega-3', 'protein'],
        isVisible: true,
        isFeatured: false,
        discountPrice: 10.99,
        discountStartDate: new Date().toISOString(),
        discountEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        nutritionInfo: { calories: 208, protein: 22, carbs: 0, fat: 12 },
        allergens: ['fish'],
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        manufacturer: 'Ocean Fresh',
        countryOfOrigin: 'Norway',
        addedBy: adminId
      },

      // Bakery
      {
        name: 'Artisan Sourdough Bread',
        description: 'Fresh baked artisan sourdough bread with crispy crust',
        price: 4.99,
        categoryId: categories['Bakery'],
        sku: 'BAKERY-BREAD-SOURDOUGH-001',
        barcode: '1234567890009',
        unit: 'loaf',
        weight: 1.0,
        dimensions: { length: 8, width: 4, height: 4 },
        stock: 12,
        minStock: 3,
        maxStock: 24,
        images: ['https://picsum.photos/400/300?random=9'],
        tags: ['bakery', 'bread', 'sourdough', 'artisan', 'fresh'],
        isVisible: true,
        isFeatured: true,
        discountPrice: null,
        discountStartDate: null,
        discountEndDate: null,
        nutritionInfo: { calories: 200, protein: 6, carbs: 40, fiber: 2 },
        allergens: ['gluten', 'wheat'],
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        manufacturer: 'Artisan Bakery',
        countryOfOrigin: 'USA',
        addedBy: adminId
      },
      {
        name: 'Chocolate Croissants',
        description: 'Buttery chocolate croissants, perfect for breakfast',
        price: 2.99,
        categoryId: categories['Bakery'],
        sku: 'BAKERY-CROISSANT-CHOC-001',
        barcode: '1234567890010',
        unit: 'piece',
        weight: 0.2,
        dimensions: { length: 4, width: 2, height: 1 },
        stock: 25,
        minStock: 5,
        maxStock: 50,
        images: ['https://picsum.photos/400/300?random=10'],
        tags: ['bakery', 'croissant', 'chocolate', 'pastry', 'breakfast'],
        isVisible: true,
        isFeatured: false,
        discountPrice: 2.49,
        discountStartDate: new Date().toISOString(),
        discountEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        nutritionInfo: { calories: 300, protein: 5, carbs: 35, fat: 18 },
        allergens: ['gluten', 'wheat', 'dairy', 'eggs'],
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        manufacturer: 'French Bakery',
        countryOfOrigin: 'USA',
        addedBy: adminId
      },

      // Pantry
      {
        name: 'Extra Virgin Olive Oil',
        description: 'Premium extra virgin olive oil from Italy',
        price: 9.99,
        categoryId: categories['Pantry'],
        sku: 'PANTRY-OIL-OLIVE-001',
        barcode: '1234567890011',
        unit: 'bottle',
        weight: 0.5,
        dimensions: { length: 3, width: 3, height: 8 },
        stock: 20,
        minStock: 4,
        maxStock: 40,
        images: ['https://picsum.photos/400/300?random=11'],
        tags: ['pantry', 'oil', 'olive', 'extra-virgin', 'cooking'],
        isVisible: true,
        isFeatured: true,
        discountPrice: null,
        discountStartDate: null,
        discountEndDate: null,
        nutritionInfo: { calories: 120, protein: 0, carbs: 0, fat: 14 },
        allergens: [],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        manufacturer: 'Italian Gold',
        countryOfOrigin: 'Italy',
        addedBy: adminId
      },
      {
        name: 'Organic Quinoa',
        description: 'Premium organic quinoa, perfect for healthy meals',
        price: 6.99,
        categoryId: categories['Pantry'],
        sku: 'PANTRY-GRAIN-QUINOA-001',
        barcode: '1234567890012',
        unit: 'bag',
        weight: 1.0,
        dimensions: { length: 6, width: 4, height: 2 },
        stock: 18,
        minStock: 4,
        maxStock: 36,
        images: ['https://picsum.photos/400/300?random=12'],
        tags: ['pantry', 'grain', 'quinoa', 'organic', 'healthy'],
        isVisible: true,
        isFeatured: false,
        discountPrice: 5.99,
        discountStartDate: new Date().toISOString(),
        discountEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        nutritionInfo: { calories: 120, protein: 4, carbs: 22, fiber: 2.8 },
        allergens: [],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        manufacturer: 'Ancient Grains',
        countryOfOrigin: 'Peru',
        addedBy: adminId
      },
      {
        name: 'Organic Honey',
        description: 'Pure organic honey from local beekeepers',
        price: 7.99,
        categoryId: categories['Pantry'],
        sku: 'PANTRY-SWEETENER-HONEY-001',
        barcode: '1234567890013',
        unit: 'jar',
        weight: 0.5,
        dimensions: { length: 3, width: 3, height: 4 },
        stock: 15,
        minStock: 3,
        maxStock: 30,
        images: ['https://picsum.photos/400/300?random=13'],
        tags: ['pantry', 'sweetener', 'honey', 'organic', 'natural'],
        isVisible: true,
        isFeatured: true,
        discountPrice: 6.99,
        discountStartDate: new Date().toISOString(),
        discountEndDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        nutritionInfo: { calories: 64, protein: 0.1, carbs: 17, fiber: 0 },
        allergens: [],
        expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(),
        manufacturer: 'Local Bee Co.',
        countryOfOrigin: 'USA',
        addedBy: adminId
      }
    ];

    console.log(`📦 Creating ${products.length} products...`);

    let createdCount = 0;
    let featuredCount = 0;

    for (const productData of products) {
      try {
        // Create Product entity to validate data
        const product = new Product(productData);
        
        // Convert to persistence format
        const persistenceData = product.toPersistence();
        
        // Remove the id field if it's null to avoid storing null IDs in Firestore
        if (persistenceData.id === null) {
          delete persistenceData.id;
        }
        
        // Add to Firestore
        const productRef = await db.collection('products').add(persistenceData);
        
        console.log(`✅ Product created: ${productData.name} (ID: ${productRef.id})`);
        
        if (productData.isFeatured) {
          featuredCount++;
        }
        
        createdCount++;
        
        // Add small delay to avoid overwhelming Firestore
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error creating product ${productData.name}:`, error.message);
      }
    }

    console.log('');
    console.log('🎉 Product population completed!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`- Total products created: ${createdCount}`);
    console.log(`- Featured products: ${featuredCount}`);
    console.log(`- Categories covered: ${Object.keys(categories).length}`);
    console.log('');
    console.log('🔍 You can now test the featured products endpoint:');
    console.log('- GET /api/products/featured');
    console.log('- GET /api/products?featured=true');
    console.log('');
    console.log('🚀 Start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Error populating products:', error);
    process.exit(1);
  }
}

populateProducts();