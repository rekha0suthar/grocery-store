import { productService } from '../../services/productService.js';

// Mock the api service - note that api.js exports a default export
jest.mock('../../services/api.js', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }
}));

import api from '../../services/api.js'; // Import as default

describe('productService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch products with default parameters', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 10.99 },
        { id: '2', name: 'Product 2', price: 15.99 }
      ];
      api.get.mockResolvedValue({ data: mockProducts });

      const result = await productService.getProducts();

      expect(api.get).toHaveBeenCalledWith('/products', { params: {} });
      expect(result.data).toEqual(mockProducts);
    });

    it('should fetch products with custom parameters', async () => {
      const mockProducts = [{ id: '1', name: 'Product 1', price: 10.99 }];
      api.get.mockResolvedValue({ data: mockProducts });

      const params = { page: 2, limit: 10, category: 'electronics' };
      const result = await productService.getProducts(params);

      expect(api.get).toHaveBeenCalledWith('/products', { params });
      expect(result.data).toEqual(mockProducts);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      api.get.mockRejectedValue(error);

      await expect(productService.getProducts()).rejects.toThrow('API Error');
    });
  });

  describe('getProductById', () => {
    it('should fetch a product by ID', async () => {
      const mockProduct = { id: '1', name: 'Product 1', price: 10.99 };
      api.get.mockResolvedValue({ data: mockProduct });

      const result = await productService.getProductById('1');

      expect(api.get).toHaveBeenCalledWith('/products/1');
      expect(result.data).toEqual(mockProduct);
    });

    it('should handle API errors', async () => {
      const error = new Error('Product not found');
      api.get.mockRejectedValue(error);

      await expect(productService.getProductById('1')).rejects.toThrow('Product not found');
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const newProduct = { name: 'New Product', price: 20.99 };
      const createdProduct = { id: '3', ...newProduct };
      api.post.mockResolvedValue({ data: createdProduct });

      const result = await productService.createProduct(newProduct);

      expect(api.post).toHaveBeenCalledWith('/products', newProduct);
      expect(result.data).toEqual(createdProduct);
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to create product');
      api.post.mockRejectedValue(error);

      await expect(productService.createProduct({})).rejects.toThrow('Failed to create product');
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      const productId = '1';
      const updatedProduct = { name: 'Updated Product', price: 12.99 };
      const resultProduct = { id: productId, ...updatedProduct };
      api.put.mockResolvedValue({ data: resultProduct });

      const result = await productService.updateProduct(productId, updatedProduct);

      expect(api.put).toHaveBeenCalledWith(`/products/${productId}`, updatedProduct);
      expect(result.data).toEqual(resultProduct);
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to update product');
      api.put.mockRejectedValue(error);

      await expect(productService.updateProduct('1', {})).rejects.toThrow('Failed to update product');
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      api.delete.mockResolvedValue({ data: { success: true } });

      const result = await productService.deleteProduct('1');

      expect(api.delete).toHaveBeenCalledWith('/products/1');
      expect(result.data).toEqual({ success: true });
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to delete product');
      api.delete.mockRejectedValue(error);

      await expect(productService.deleteProduct('1')).rejects.toThrow('Failed to delete product');
    });
  });

  describe('searchProducts', () => {
    it('should search products by query', async () => {
      const mockResults = [{ id: '1', name: 'Search Result', price: 10.99 }];
      api.get.mockResolvedValue({ data: mockResults });

      const searchParams = { query: 'test query' };
      const result = await productService.searchProducts(searchParams);

      expect(api.get).toHaveBeenCalledWith('/products/search', { params: searchParams });
      expect(result.data).toEqual(mockResults);
    });

    it('should handle API errors', async () => {
      const error = new Error('Search failed');
      api.get.mockRejectedValue(error);

      await expect(productService.searchProducts({ query: 'test' })).rejects.toThrow('Search failed');
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      const productId = '1';
      const stockData = { quantity: 50 };
      const updatedProduct = { id: productId, stock: 50 };
      api.patch.mockResolvedValue({ data: updatedProduct });

      const result = await productService.updateStock(productId, stockData);

      expect(api.patch).toHaveBeenCalledWith(`/products/${productId}/stock`, stockData);
      expect(result.data).toEqual(updatedProduct);
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to update stock');
      api.patch.mockRejectedValue(error);

      await expect(productService.updateStock('1', {})).rejects.toThrow('Failed to update stock');
    });
  });

  describe('getProductsByCategory', () => {
    it('should fetch products by category', async () => {
      const mockProducts = [{ id: '1', name: 'Category Product', price: 10.99 }];
      api.get.mockResolvedValue({ data: mockProducts });

      const categoryId = 'electronics';
      const params = { page: 1, limit: 10 };
      const result = await productService.getProductsByCategory(categoryId, params);

      expect(api.get).toHaveBeenCalledWith(`/products/category/${categoryId}`, { params });
      expect(result.data).toEqual(mockProducts);
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch products by category');
      api.get.mockRejectedValue(error);

      await expect(productService.getProductsByCategory('electronics')).rejects.toThrow('Failed to fetch products by category');
    });
  });
});
