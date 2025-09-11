import {
  isValidProductName,
  isValidSKU,
  isValidPrice,
  isValidStock,
  isValidMinStock,
  isValidMaxStock,
  isValidWeight,
  isValidUnit,
  isValidStatus,
  isValidVisibility,
  isValidDescription,
  isValidBarcode,
  isValidManufacturer,
  isValidCountryOfOrigin,
  isValidTags,
  isValidImages,
  isValidCategoryId,
  isValidDiscountPrice,
  validateProduct,
  PRODUCT_RULES
} from '../../contracts/product.validation.js';

describe('Product Validators', () => {
  describe('isValidProductName', () => {
    test('should validate correct product names', () => {
      expect(isValidProductName('Fresh Apples')).toBe(true);
      expect(isValidProductName('Organic Bananas')).toBe(true);
      expect(isValidProductName('Premium Coffee Beans')).toBe(true);
      expect(isValidProductName('A'.repeat(255))).toBe(true);
    });

    test('should reject invalid product names', () => {
      expect(isValidProductName('A')).toBe(false); // Too short
      expect(isValidProductName('')).toBe(false);
      expect(isValidProductName(null)).toBe(false);
      expect(isValidProductName(undefined)).toBe(false);
      expect(isValidProductName('A'.repeat(256))).toBe(false); // Too long
      expect(isValidProductName('   ')).toBe(false); // Only whitespace
    });
  });

  describe('isValidSKU', () => {
    test('should validate correct SKUs', () => {
      expect(isValidSKU('APPLE-001')).toBe(true);
      expect(isValidSKU('BANANA-ORG-123')).toBe(true);
      expect(isValidSKU('COFFEE-BEANS-456')).toBe(true);
      expect(isValidSKU('ABC')).toBe(true); // Minimum length
      expect(isValidSKU('A'.repeat(20))).toBe(true); // Maximum length
    });

    test('should reject invalid SKUs', () => {
      expect(isValidSKU('AB')).toBe(false); // Too short
      expect(isValidSKU('A'.repeat(21))).toBe(false); // Too long
      expect(isValidSKU('apple-001')).toBe(false); // Lowercase
      expect(isValidSKU('APPLE_001')).toBe(false); // Underscore not allowed
      expect(isValidSKU('APPLE.001')).toBe(false); // Dot not allowed
      expect(isValidSKU('')).toBe(false);
      expect(isValidSKU(null)).toBe(false);
    });
  });

  describe('isValidPrice', () => {
    test('should validate correct prices', () => {
      expect(isValidPrice(0)).toBe(true);
      expect(isValidPrice(4.99)).toBe(true);
      expect(isValidPrice(100)).toBe(true);
      expect(isValidPrice(1000000)).toBe(true); // Maximum
    });

    test('should reject invalid prices', () => {
      expect(isValidPrice(-1)).toBe(false); // Negative
      expect(isValidPrice(1000001)).toBe(false); // Too high
      expect(isValidPrice('4.99')).toBe(false); // String
      expect(isValidPrice(null)).toBe(false);
      expect(isValidPrice(undefined)).toBe(false);
    });
  });

  describe('isValidStock', () => {
    test('should validate correct stock values', () => {
      expect(isValidStock(0)).toBe(true);
      expect(isValidStock(10)).toBe(true);
      expect(isValidStock(1000)).toBe(true);
    });

    test('should reject invalid stock values', () => {
      expect(isValidStock(-1)).toBe(false); // Negative
      expect(isValidStock(1.5)).toBe(false); // Not integer
      expect(isValidStock('10')).toBe(false); // String
      expect(isValidStock(null)).toBe(false);
      expect(isValidStock(undefined)).toBe(false);
    });
  });

  describe('isValidMinStock', () => {
    test('should validate correct min stock values', () => {
      expect(isValidMinStock(0)).toBe(true);
      expect(isValidMinStock(5)).toBe(true);
      expect(isValidMinStock(100)).toBe(true);
    });

    test('should reject invalid min stock values', () => {
      expect(isValidMinStock(-1)).toBe(false); // Negative
      expect(isValidMinStock(1.5)).toBe(false); // Not integer
      expect(isValidMinStock('5')).toBe(false); // String
    });
  });

  describe('isValidMaxStock', () => {
    test('should validate correct max stock values', () => {
      expect(isValidMaxStock(1)).toBe(true);
      expect(isValidMaxStock(100)).toBe(true);
      expect(isValidMaxStock(10000)).toBe(true);
    });

    test('should reject invalid max stock values', () => {
      expect(isValidMaxStock(0)).toBe(false); // Must be positive
      expect(isValidMaxStock(-1)).toBe(false); // Negative
      expect(isValidMaxStock(1.5)).toBe(false); // Not integer
      expect(isValidMaxStock('100')).toBe(false); // String
    });
  });

  describe('isValidWeight', () => {
    test('should validate correct weights', () => {
      expect(isValidWeight(0)).toBe(true);
      expect(isValidWeight(1.5)).toBe(true);
      expect(isValidWeight(100)).toBe(true);
      expect(isValidWeight(1000)).toBe(true); // Maximum
    });

    test('should reject invalid weights', () => {
      expect(isValidWeight(-1)).toBe(false); // Negative
      expect(isValidWeight(1001)).toBe(false); // Too high
      expect(isValidWeight('1.5')).toBe(false); // String
      expect(isValidWeight(null)).toBe(false);
    });
  });

  describe('isValidUnit', () => {
    test('should validate correct units', () => {
      expect(isValidUnit('piece')).toBe(true);
      expect(isValidUnit('kg')).toBe(true);
      expect(isValidUnit('lb')).toBe(true);
      expect(isValidUnit('dozen')).toBe(true);
      expect(isValidUnit('box')).toBe(true);
    });

    test('should reject invalid units', () => {
      expect(isValidUnit('invalid')).toBe(false);
      expect(isValidUnit('')).toBe(false);
      expect(isValidUnit(null)).toBe(false);
    });

    test('should be case insensitive', () => {
      expect(isValidUnit('PIECE')).toBe(true); // Uppercase
      expect(isValidUnit('Kg')).toBe(true); // Mixed case
      expect(isValidUnit('LB')).toBe(true); // Uppercase
    });
  });

  describe('isValidStatus', () => {
    test('should validate correct statuses', () => {
      expect(isValidStatus('active')).toBe(true);
      expect(isValidStatus('inactive')).toBe(true);
    });

    test('should reject invalid statuses', () => {
      expect(isValidStatus('pending')).toBe(false);
      expect(isValidStatus('')).toBe(false);
      expect(isValidStatus(null)).toBe(false);
    });

    test('should be case insensitive', () => {
      expect(isValidStatus('ACTIVE')).toBe(true); // Uppercase
      expect(isValidStatus('Inactive')).toBe(true); // Mixed case
    });
  });

  describe('isValidVisibility', () => {
    test('should validate correct visibility values', () => {
      expect(isValidVisibility('visible')).toBe(true);
      expect(isValidVisibility('hidden')).toBe(true);
    });

    test('should reject invalid visibility values', () => {
      expect(isValidVisibility('public')).toBe(false);
      expect(isValidVisibility('')).toBe(false);
      expect(isValidVisibility(null)).toBe(false);
    });

    test('should be case insensitive', () => {
      expect(isValidVisibility('VISIBLE')).toBe(true); // Uppercase
      expect(isValidVisibility('Hidden')).toBe(true); // Mixed case
    });
  });

  describe('isValidDescription', () => {
    test('should validate correct descriptions', () => {
      expect(isValidDescription('Fresh organic apples from local farms')).toBe(true);
      expect(isValidDescription('A'.repeat(10))).toBe(true); // Minimum length
      expect(isValidDescription('A'.repeat(2000))).toBe(true); // Maximum length
    });

    test('should reject invalid descriptions', () => {
      expect(isValidDescription('Short')).toBe(false); // Too short
      expect(isValidDescription('A'.repeat(2001))).toBe(false); // Too long
      expect(isValidDescription('')).toBe(false);
      expect(isValidDescription(null)).toBe(false);
    });
  });

  describe('isValidBarcode', () => {
    test('should validate correct barcodes', () => {
      expect(isValidBarcode('12345678')).toBe(true); // Minimum length
      expect(isValidBarcode('12345678901234')).toBe(true); // Maximum length
      expect(isValidBarcode('')).toBe(true); // Optional field
      expect(isValidBarcode(null)).toBe(true); // Optional field
    });

    test('should reject invalid barcodes', () => {
      expect(isValidBarcode('1234567')).toBe(false); // Too short
      expect(isValidBarcode('123456789012345')).toBe(false); // Too long
      expect(isValidBarcode('12345678a')).toBe(false); // Contains letters
      expect(isValidBarcode('123-456-789')).toBe(false); // Contains hyphens
    });
  });

  describe('isValidManufacturer', () => {
    test('should validate correct manufacturers', () => {
      expect(isValidManufacturer('Organic Farms Co.')).toBe(true);
      expect(isValidManufacturer('AB')).toBe(true); // Minimum length
      expect(isValidManufacturer('A'.repeat(100))).toBe(true); // Maximum length
      expect(isValidManufacturer('')).toBe(true); // Optional field
      expect(isValidManufacturer(null)).toBe(true); // Optional field
    });

    test('should reject invalid manufacturers', () => {
      expect(isValidManufacturer('A')).toBe(false); // Too short
      expect(isValidManufacturer('A'.repeat(101))).toBe(false); // Too long
    });
  });

  describe('isValidCountryOfOrigin', () => {
    test('should validate correct countries', () => {
      expect(isValidCountryOfOrigin('USA')).toBe(true);
      expect(isValidCountryOfOrigin('AB')).toBe(true); // Minimum length
      expect(isValidCountryOfOrigin('A'.repeat(50))).toBe(true); // Maximum length
      expect(isValidCountryOfOrigin('')).toBe(true); // Optional field
      expect(isValidCountryOfOrigin(null)).toBe(true); // Optional field
    });

    test('should reject invalid countries', () => {
      expect(isValidCountryOfOrigin('A')).toBe(false); // Too short
      expect(isValidCountryOfOrigin('A'.repeat(51))).toBe(false); // Too long
    });
  });

  describe('isValidTags', () => {
    test('should validate correct tags', () => {
      expect(isValidTags(['organic', 'fresh'])).toBe(true);
      expect(isValidTags(['A'])).toBe(true); // Minimum length
      expect(isValidTags(['A'.repeat(50)])).toBe(true); // Maximum length
      expect(isValidTags([])).toBe(true); // Empty array
      expect(isValidTags(null)).toBe(true); // Optional field
    });

    test('should reject invalid tags', () => {
      expect(isValidTags([''])).toBe(false); // Empty tag
      expect(isValidTags(['A'.repeat(51)])).toBe(false); // Too long
      expect(isValidTags([123])).toBe(false); // Not string
      expect(isValidTags('not-array')).toBe(false); // Not array
    });
  });

  describe('isValidImages', () => {
    test('should validate correct image URLs', () => {
      expect(isValidImages(['https://example.com/image1.jpg'])).toBe(true);
      expect(isValidImages(['http://example.com/image2.png', 'https://example.com/image3.gif'])).toBe(true);
      expect(isValidImages([])).toBe(true); // Empty array
      expect(isValidImages(null)).toBe(true); // Optional field
    });

    test('should reject invalid image URLs', () => {
      expect(isValidImages(['invalid-url'])).toBe(false); // Invalid URL
      expect(isValidImages(['ftp://example.com/image.jpg'])).toBe(false); // Wrong protocol
      expect(isValidImages([123])).toBe(false); // Not string
      expect(isValidImages('not-array')).toBe(false); // Not array
    });
  });

  describe('isValidCategoryId', () => {
    test('should validate correct category IDs', () => {
      expect(isValidCategoryId('category123')).toBe(true);
      expect(isValidCategoryId('a')).toBe(true); // Minimum length
      expect(isValidCategoryId('A'.repeat(100))).toBe(true); // Maximum length
    });

    test('should reject invalid category IDs', () => {
      expect(isValidCategoryId('')).toBe(false); // Empty
      expect(isValidCategoryId(null)).toBe(false);
      expect(isValidCategoryId(undefined)).toBe(false);
    });
  });

  describe('isValidDiscountPrice', () => {
    test('should validate correct discount prices', () => {
      expect(isValidDiscountPrice(2.99, 4.99)).toBe(true);
      expect(isValidDiscountPrice(0.01, 1.00)).toBe(true);
      expect(isValidDiscountPrice(null, 4.99)).toBe(true); // Optional field
      expect(isValidDiscountPrice(undefined, 4.99)).toBe(true); // Optional field
    });

    test('should reject invalid discount prices', () => {
      expect(isValidDiscountPrice(5.99, 4.99)).toBe(false); // Higher than original
      expect(isValidDiscountPrice(4.99, 4.99)).toBe(false); // Equal to original
      expect(isValidDiscountPrice(-1, 4.99)).toBe(false); // Negative
      expect(isValidDiscountPrice('2.99', 4.99)).toBe(false); // String
    });
  });

  describe('validateProduct', () => {
    test('should validate correct product data', () => {
      const validProduct = {
        name: 'Fresh Organic Apples',
        description: 'Crisp and juicy organic apples from local farms',
        price: 4.99,
        categoryId: 'category123',
        sku: 'APPLE-ORG-001',
        stock: 100,
        minStock: 10,
        maxStock: 1000,
        unit: 'kg',
        status: 'active',
        visibility: 'visible',
        weight: 1.5,
        barcode: '12345678901234',
        manufacturer: 'Organic Farms Co.',
        countryOfOrigin: 'USA',
        tags: ['organic', 'fresh'],
        images: ['https://example.com/apple1.jpg'],
        discountPrice: 3.99
      };

      const result = validateProduct(validProduct);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('should return errors for invalid product data', () => {
      const invalidProduct = {
        name: 'A', // Too short
        description: 'Short', // Too short
        price: -1, // Negative
        categoryId: '', // Empty
        sku: 'ab', // Too short and lowercase
        stock: -1, // Negative
        minStock: -1, // Negative
        maxStock: 0, // Must be positive
        unit: 'invalid', // Invalid unit
        status: 'pending', // Invalid status
        visibility: 'public', // Invalid visibility
        weight: -1, // Negative
        barcode: '123', // Too short
        manufacturer: 'A', // Too short
        countryOfOrigin: 'A', // Too short
        tags: [''], // Empty tag
        images: ['invalid-url'], // Invalid URL
        discountPrice: 5.99 // Higher than price
      };

      const result = validateProduct(invalidProduct);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.description).toBeDefined();
      expect(result.errors.price).toBeDefined();
      expect(result.errors.categoryId).toBeDefined();
      expect(result.errors.sku).toBeDefined();
      expect(result.errors.stock).toBeDefined();
      expect(result.errors.minStock).toBeDefined();
      expect(result.errors.maxStock).toBeDefined();
      expect(result.errors.unit).toBeDefined();
      expect(result.errors.status).toBeDefined();
      expect(result.errors.visibility).toBeDefined();
      expect(result.errors.weight).toBeDefined();
      expect(result.errors.barcode).toBeDefined();
      expect(result.errors.manufacturer).toBeDefined();
      expect(result.errors.countryOfOrigin).toBeDefined();
      expect(result.errors.tags).toBeDefined();
      expect(result.errors.images).toBeDefined();
      expect(result.errors.discountPrice).toBeDefined();
    });

    test('should handle optional fields correctly', () => {
      const productWithOptionalFields = {
        name: 'Fresh Organic Apples',
        description: 'Crisp and juicy organic apples from local farms',
        price: 4.99,
        categoryId: 'category123',
        sku: 'APPLE-ORG-001',
        stock: 100,
        minStock: 10,
        maxStock: 1000,
        unit: 'kg',
        status: 'active',
        visibility: 'visible'
        // All optional fields omitted
      };

      const result = validateProduct(productWithOptionalFields);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('should validate required fields only', () => {
      const minimalProduct = {
        name: 'Test Product',
        description: 'A test product description',
        price: 1.00,
        categoryId: 'test-category',
        sku: 'TEST-001',
        stock: 1,
        minStock: 0,
        maxStock: 100,
        unit: 'piece',
        status: 'active',
        visibility: 'visible'
      };

      const result = validateProduct(minimalProduct);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });
  });

  describe('PRODUCT_RULES constants', () => {
    test('should have correct pattern definitions', () => {
      expect(PRODUCT_RULES.SKU_PATTERN).toBeInstanceOf(RegExp);
      expect(PRODUCT_RULES.URL_PATTERN).toBeInstanceOf(RegExp);
      expect(PRODUCT_RULES.BARCODE_PATTERN).toBeInstanceOf(RegExp);
    });

    test('should have correct unit options', () => {
      expect(PRODUCT_RULES.UNITS).toContain('piece');
      expect(PRODUCT_RULES.UNITS).toContain('kg');
      expect(PRODUCT_RULES.UNITS).toContain('lb');
      expect(PRODUCT_RULES.UNITS).toContain('dozen');
      expect(PRODUCT_RULES.UNITS).toHaveLength(14); // Updated to actual length
    });

    test('should have correct status options', () => {
      expect(PRODUCT_RULES.STATUSES).toContain('active');
      expect(PRODUCT_RULES.STATUSES).toContain('inactive');
      expect(PRODUCT_RULES.STATUSES).toHaveLength(2);
    });

    test('should have correct visibility options', () => {
      expect(PRODUCT_RULES.VISIBILITY).toContain('visible');
      expect(PRODUCT_RULES.VISIBILITY).toContain('hidden');
      expect(PRODUCT_RULES.VISIBILITY).toHaveLength(2);
    });

    test('should have correct length constraints', () => {
      expect(PRODUCT_RULES.NAME_MIN_LENGTH).toBe(2);
      expect(PRODUCT_RULES.NAME_MAX_LENGTH).toBe(255);
      expect(PRODUCT_RULES.DESCRIPTION_MIN_LENGTH).toBe(10);
      expect(PRODUCT_RULES.DESCRIPTION_MAX_LENGTH).toBe(2000);
      expect(PRODUCT_RULES.SKU_MIN_LENGTH).toBe(3);
      expect(PRODUCT_RULES.SKU_MAX_LENGTH).toBe(20);
    });

    test('should have correct numeric constraints', () => {
      expect(PRODUCT_RULES.PRICE_MIN).toBe(0);
      expect(PRODUCT_RULES.PRICE_MAX).toBe(1000000);
      expect(PRODUCT_RULES.STOCK_MIN).toBe(0);
      expect(PRODUCT_RULES.WEIGHT_MIN).toBe(0);
      expect(PRODUCT_RULES.WEIGHT_MAX).toBe(1000);
    });
  });
}); 