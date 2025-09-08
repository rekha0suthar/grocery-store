import { Product } from '../../entities/Product.js';

export class ManageProductUseCase {
  /**
   * @param {{ productRepo: { findById(id):Promise<Product>, findBySku(sku):Promise<Product>, create(data):Promise<Product>, update(id, data):Promise<Product>, findAll(filters, limit, offset):Promise<Product[]> } }} deps
   */
  constructor({ productRepo }) {
    this.productRepository = productRepo;
  }

  async createProduct(productData, userId) {
    try {
      const validation = this.validateProductData(productData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          product: null
        };
      }

      const existingProduct = await this.productRepository.findBySku(productData.sku);
      if (existingProduct) {
        return {
          success: false,
          message: 'Product with this SKU already exists',
          product: null
        };
      }

      const productEntity = new Product({
        ...productData,
        addedBy: userId,
        isVisible: true
      });

      const createdProduct = await this.productRepository.create(productEntity.toJSON());

      return {
        success: true,
        message: 'Product created successfully',
        product: Product.fromJSON(createdProduct)
      };

    } catch (error) {
      console.error('Product creation error:', error);
      return {
        success: false,
        message: 'Product creation failed',
        product: null,
        error: error.message
      };
    }
  }

  async updateProduct(productId, updateData, userId) {
    try {
      const existingProduct = await this.productRepository.findById(productId);
      if (!existingProduct) {
        return {
          success: false,
          message: 'Product not found',
          product: null
        };
      }

      const validation = this.validateUpdateData(updateData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          product: null
        };
      }

      const updatedProduct = await this.productRepository.update(productId, updateData);

      return {
        success: true,
        message: 'Product updated successfully',
        product: Product.fromJSON(updatedProduct)
      };

    } catch (error) {
      console.error('Product update error:', error);
      return {
        success: false,
        message: 'Product update failed',
        product: null,
        error: error.message
      };
    }
  }

  async deleteProduct(productId, userId) {
    try {
      const existingProduct = await this.productRepository.findById(productId);
      if (!existingProduct) {
        return {
          success: false,
          message: 'Product not found',
          product: null
        };
      }

      await this.productRepository.update(productId, { isVisible: false });

      return {
        success: true,
        message: 'Product deleted successfully',
        product: null
      };

    } catch (error) {
      console.error('Product deletion error:', error);
      return {
        success: false,
        message: 'Product deletion failed',
        product: null,
        error: error.message
      };
    }
  }

  async getProducts(filters = {}, limit = 50, offset = 0) {
    try {
      const products = await this.productRepository.findAll(filters, limit, offset);

      return {
        success: true,
        message: 'Products retrieved successfully',
        products: products.map(product => Product.fromJSON(product)),
        total: products.length
      };

    } catch (error) {
      console.error('Get products error:', error);
      return {
        success: false,
        message: 'Failed to retrieve products',
        products: [],
        total: 0,
        error: error.message
      };
    }
  }

  validateProductData(productData) {
    if (!productData || !productData.name || !productData.price || !productData.sku) {
      return {
        isValid: false,
        message: 'Name, price, and SKU are required'
      };
    }

    if (productData.price <= 0) {
      return {
        isValid: false,
        message: 'Price must be greater than 0'
      };
    }

    if (productData.stock < 0) {
      return {
        isValid: false,
        message: 'Stock cannot be negative'
      };
    }

    return { isValid: true };
  }

  validateUpdateData(updateData) {
    if (updateData.price && updateData.price <= 0) {
      return {
        isValid: false,
        message: 'Price must be greater than 0'
      };
    }

    if (updateData.stock && updateData.stock < 0) {
      return {
        isValid: false,
        message: 'Stock cannot be negative'
      };
    }

    return { isValid: true };
  }

  async execute(operation, data) {
    try {
      switch (operation) {
        case 'getAllProducts':
          return await this.getAllProducts(data);
        case 'getProductById':
          return await this.getProductById(data.id);
        case 'updateProduct':
          return await this.updateProduct(data.id, data, data.userId, data.userRole);
        case 'deleteProduct':
          return await this.deleteProduct(data.id, data.userId, data.userRole);
        case 'searchProducts':
          return await this.searchProducts(data);
        default:
          return {
            success: false,
            message: 'Unknown operation',
            products: null
          };
      }
    } catch (error) {
      console.error('ManageProductUseCase execute error:', error);
      return {
        success: false,
        message: 'Failed to execute operation',
        products: null,
        error: error.message
      };
    }
  }

  async getAllProducts(filters = {}) {
    try {
      const { page = 1, limit = 10, ...actualFilters } = filters;
      const offset = (page - 1) * limit;
      
      const productsData = await this.productRepository.findAll(actualFilters, limit, offset);
      const products = productsData.map(data => Product.fromJSON(data));

      return {
        success: true,
        message: 'Products retrieved successfully',
        products: products
      };

    } catch (error) {
      console.error('Get all products error:', error);
      return {
        success: false,
        message: 'Failed to retrieve products',
        products: [],
        error: error.message
      };
    }
  }

  async getProductById(productId) {
    try {
      const productData = await this.productRepository.findById(productId);
      if (!productData) {
        return {
          success: false,
          message: 'Product not found',
          product: null
        };
      }

      return {
        success: true,
        message: 'Product retrieved successfully',
        product: Product.fromJSON(productData)
      };

    } catch (error) {
      console.error('Get product by ID error:', error);
      return {
        success: false,
        message: 'Failed to retrieve product',
        product: null,
        error: error.message
      };
    }
  }

  async updateProduct(productId, updateData, userId, userRole) {
    try {
      if (!this.canManageProducts(userRole)) {
        return {
          success: false,
          message: 'Insufficient permissions to update products',
          product: null
        };
      }

      const existingProduct = await this.productRepository.findById(productId);
      if (!existingProduct) {
        return {
          success: false,
          message: 'Product not found',
          product: null
        };
      }

      const product = Product.fromJSON(existingProduct);
      
      // Update product data
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && key !== 'id') {
          product[key] = updateData[key];
        }
      });

      const validation = this.validateProductData(product.toJSON());
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          product: null
        };
      }

      const updatedProduct = await this.productRepository.update(productId, product.toJSON());

      return {
        success: true,
        message: 'Product updated successfully',
        product: Product.fromJSON(updatedProduct)
      };

    } catch (error) {
      console.error('Update product error:', error);
      return {
        success: false,
        message: 'Failed to update product',
        product: null,
        error: error.message
      };
    }
  }

  async deleteProduct(productId, userId, userRole) {
    try {
      if (!this.canManageProducts(userRole)) {
        return {
          success: false,
          message: 'Insufficient permissions to delete products',
          product: null
        };
      }

      const existingProduct = await this.productRepository.findById(productId);
      if (!existingProduct) {
        return {
          success: false,
          message: 'Product not found',
          product: null
        };
      }

      await this.productRepository.delete(productId);

      return {
        success: true,
        message: 'Product deleted successfully',
        product: null
      };

    } catch (error) {
      console.error('Delete product error:', error);
      return {
        success: false,
        message: 'Failed to delete product',
        product: null,
        error: error.message
      };
    }
  }

  async searchProducts(filters = {}) {
    try {
      const { query, page = 1, limit = 10 } = filters;
      const offset = (page - 1) * limit;
      
      // Use findAll with search filters instead of separate search method
      const searchFilters = { ...filters, search: query };
      const productsData = await this.productRepository.findAll(searchFilters, limit, offset);
      const products = productsData.map(data => Product.fromJSON(data));

      return {
        success: true,
        message: 'Products retrieved successfully',
        products: products
      };

    } catch (error) {
      console.error('Search products error:', error);
      return {
        success: false,
        message: 'Failed to search products',
        products: [],
        error: error.message
      };
    }
  }

  canManageProducts(userRole) {
    return ['admin', 'store_manager'].includes(userRole);
  }
}
