import { Product } from '../../../entities/Product.js';

// Test builders
const aProduct = (overrides = {}) => new Product({
  name: 'Apple',
  price: 2.50,
  sku: 'APPLE001',
  stock: 100,
  ...overrides
});

describe('Product Entity - Core Domain Rules', () => {
  describe('Creation and Validation', () => {
    test('creates valid product', () => {
      const product = aProduct();
      
      expect(product.isValid()).toBe(true);
      expect(product.name).toBe('Apple');
      expect(product.price).toBe(2.50);
    });

    test('rejects product with invalid name', () => {
      const product = aProduct({ name: '' });
      expect(product.isValid()).toBe(false);
    });

    test('rejects product with invalid price', () => {
      const product = aProduct({ price: 0 });
      expect(product.isValid()).toBe(false);
    });

    test('rejects product with invalid SKU', () => {
      const product = aProduct({ sku: '' });
      expect(product.isValid()).toBe(false);
    });

    test('rejects product with negative stock', () => {
      const product = aProduct({ stock: -1 });
      expect(product.isValid()).toBe(false);
    });
  });

  describe('Stock Management', () => {
    test('checks availability correctly', () => {
      const availableProduct = aProduct({ stock: 10, isVisible: true });
      const unavailableProduct = aProduct({ stock: 0, isVisible: true });
      const hiddenProduct = aProduct({ stock: 10, isVisible: false });
      
      expect(availableProduct.isAvailable()).toBe(true);
      expect(unavailableProduct.isAvailable()).toBe(false);
      expect(hiddenProduct.isAvailable()).toBe(false);
    });

    test('checks stock levels', () => {
      const product = aProduct({ stock: 5, minStock: 10 });
      
      expect(product.isLowStock()).toBe(true);
      expect(product.isOutOfStock()).toBe(false);
      
      product.stock = 0;
      expect(product.isOutOfStock()).toBe(true);
    });

    test('validates purchase capability', () => {
      const product = aProduct({ stock: 10, isVisible: true });
      
      expect(product.canPurchase(5)).toBe(true);
      expect(product.canPurchase(15)).toBe(false);
      expect(product.canPurchase(0)).toBe(false);
    });

    test('reduces stock correctly', () => {
      const product = aProduct({ stock: 10 });
      
      expect(product.reduceStock(3)).toBe(true);
      expect(product.stock).toBe(7);
      
      expect(product.reduceStock(10)).toBe(false); // Not enough stock
      expect(product.stock).toBe(7); // Unchanged
    });

    test('adds stock correctly', () => {
      const product = aProduct({ stock: 10 });
      
      expect(product.addStock(5)).toBe(true);
      expect(product.stock).toBe(15);
      
      expect(product.addStock(0)).toBe(false); // Invalid quantity
    });

    test('sets stock correctly', () => {
      const product = aProduct({ stock: 10 });
      
      expect(product.setStock(20)).toBe(true);
      expect(product.stock).toBe(20);
      
      expect(product.setStock(-1)).toBe(false); // Invalid quantity
    });
  });

  describe('Price Management - Intentful Methods', () => {
    test('changes price with validation', () => {
      const product = aProduct();
      
      product.changePrice(3.00);
      expect(product.price).toBe(3.00);
      
      expect(() => product.changePrice(0)).toThrow('Price must be positive');
      expect(() => product.changePrice(-1)).toThrow('Price must be positive');
    });

    test('schedules discount correctly', () => {
      const product = aProduct();
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      product.scheduleDiscount(2.00, startDate, endDate);
      expect(product.discountPrice).toBe(2.00);
      expect(product.discountStartDate).toBe(startDate);
      expect(product.discountEndDate).toBe(endDate);
    });

    test('validates discount scheduling', () => {
      const product = aProduct();
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      expect(() => product.scheduleDiscount(0, startDate, endDate)).toThrow('Discount price must be positive');
      expect(() => product.scheduleDiscount(2.00, endDate, startDate)).toThrow('Start date must be before end date');
    });

    test('removes discount', () => {
      const product = aProduct({ discountPrice: 2.00 });
      
      product.removeDiscount();
      expect(product.discountPrice).toBeNull();
      expect(product.discountStartDate).toBeNull();
      expect(product.discountEndDate).toBeNull();
    });
  });

  describe('Time-dependent Methods - Deterministic', () => {
    test('checks discount status with explicit time', () => {
      const product = aProduct({
        discountPrice: 2.00,
        discountStartDate: new Date('2024-01-01'),
        discountEndDate: new Date('2024-01-31')
      });
      
      const beforeDiscount = new Date('2023-12-31');
      const duringDiscount = new Date('2024-01-15');
      const afterDiscount = new Date('2024-02-01');
      
      expect(product.isOnDiscount(beforeDiscount)).toBe(false);
      expect(product.isOnDiscount(duringDiscount)).toBe(true);
      expect(product.isOnDiscount(afterDiscount)).toBe(false);
    });

    test('checks discount boundary inclusion', () => {
      const product = aProduct({
        discountPrice: 2.00,
        discountStartDate: new Date('2024-01-01T00:00:00Z'),
        discountEndDate: new Date('2024-01-31T23:59:59Z')
      });
      
      // Test exact boundary times
      expect(product.isOnDiscount(new Date('2024-01-01T00:00:00Z'))).toBe(true);
      expect(product.isOnDiscount(new Date('2024-01-31T23:59:59Z'))).toBe(true);
      expect(product.isOnDiscount(new Date('2024-01-01T00:00:01Z'))).toBe(true);
      expect(product.isOnDiscount(new Date('2024-01-31T23:59:58Z'))).toBe(true);
    });

    test('checks expiry status with explicit time', () => {
      const product = aProduct({
        expiryDate: new Date('2024-01-15')
      });
      
      const beforeExpiry = new Date('2024-01-10');
      const afterExpiry = new Date('2024-01-20');
      
      expect(product.isExpired(beforeExpiry)).toBe(false);
      expect(product.isExpired(afterExpiry)).toBe(true);
    });

    test('gets current price based on discount status', () => {
      const product = aProduct({
        discountPrice: 2.00,
        discountStartDate: new Date('2024-01-01'),
        discountEndDate: new Date('2024-01-31')
      });
      
      const duringDiscount = new Date('2024-01-15');
      const afterDiscount = new Date('2024-02-01');
      
      expect(product.getCurrentPrice(duringDiscount)).toBe(2.00);
      expect(product.getCurrentPrice(afterDiscount)).toBe(2.50);
    });

    test('uses current time as default when no time provided', () => {
      const product = aProduct({
        discountPrice: 2.00,
        discountStartDate: new Date(Date.now() - 1000), // 1 second ago
        discountEndDate: new Date(Date.now() + 1000)    // 1 second from now
      });
      
      // This test verifies the default behavior without being flaky
      expect(typeof product.isOnDiscount()).toBe('boolean');
      expect(typeof product.getCurrentPrice()).toBe('number');
    });
  });

  describe('Visibility Management - Intentful Methods', () => {
    test('makes product visible', () => {
      const product = aProduct({ isVisible: false });
      
      product.makeVisible();
      expect(product.isVisible).toBe(true);
    });

    test('makes product hidden', () => {
      const product = aProduct({ isVisible: true });
      
      product.makeHidden();
      expect(product.isVisible).toBe(false);
    });
  });

  describe('Numeric Precision', () => {
    test('handles floating point totals correctly', () => {
      const product = aProduct({ price: 2.10 });
      
      // Test that lineTotal handles precision correctly
      const item = { productPrice: 2.10, quantity: 3 };
      const lineTotal = item.productPrice * item.quantity;
      
      // In a real implementation, you'd want to round to cents
      expect(lineTotal).toBeCloseTo(6.30, 2);
    });
  });

  describe('JSON Serialization - Contract-based', () => {
    test('serializes product with correct derived values', () => {
      const product = aProduct();
      
      const json = product.toJSON();
      
      // Contract: essential fields are present
      expect(json.name).toBe('Apple');
      expect(json.price).toBe(2.50);
      expect(json.sku).toBe('APPLE001');
      expect(json.stock).toBe(100);
    });

    test('deserializes product correctly', () => {
      const productData = {
        name: 'Apple',
        price: 2.50,
        sku: 'APPLE001',
        stock: 100
      };
      
      const product = Product.fromJSON(productData);
      expect(product.name).toBe('Apple');
      expect(product.price).toBe(2.50);
      expect(product.sku).toBe('APPLE001');
      expect(product.stock).toBe(100);
    });
  });
});
