import { BaseRepository } from './BaseRepository.js';
import { Product } from '@grocery-store/core/entities/Product.js';

export class ProductRepository extends BaseRepository {
  constructor(databaseAdapter) {
    super('products', databaseAdapter);
  }

  async findByCategory(categoryId, limit = 100, offset = 0) {
    const result = await this.query(
      'SELECT * FROM products WHERE category_id = $1 AND is_visible = true ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [categoryId, limit, offset]
    );
    return result.rows.map(row => Product.fromJSON(row));
  }

  async findFeatured(limit = 20) {
    const result = await this.query(
      'SELECT * FROM products WHERE is_featured = true AND is_visible = true ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows.map(row => Product.fromJSON(row));
  }

  async findInStock(limit = 100, offset = 0) {
    const result = await this.query(
      'SELECT * FROM products WHERE stock > 0 AND is_visible = true ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows.map(row => Product.fromJSON(row));
  }

  async findLowStock() {
    const result = await this.query(
      'SELECT * FROM products WHERE stock <= min_stock AND is_visible = true',
      []
    );
    return result.rows.map(row => Product.fromJSON(row));
  }

  async searchProducts(searchTerm, limit = 50, offset = 0) {
    const result = await this.query(
      `SELECT * FROM products 
       WHERE is_visible = true 
       AND (to_tsvector('english', name || ' ' || description) @@ plainto_tsquery('english', $1)
            OR name ILIKE $2 OR description ILIKE $2)
       ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
      [searchTerm, `%${searchTerm}%`, limit, offset]
    );
    return result.rows.map(row => Product.fromJSON(row));
  }

  async findBySku(sku) {
    const result = await this.query(
      'SELECT * FROM products WHERE sku = $1',
      [sku]
    );
    return result.rows[0] ? Product.fromJSON(result.rows[0]) : null;
  }

  async updateStock(id, newStock) {
    const result = await this.query(
      'UPDATE products SET stock = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id, newStock]
    );
    return result.rows[0] ? Product.fromJSON(result.rows[0]) : null;
  }

  async reduceStock(id, quantity) {
    const result = await this.query(
      'UPDATE products SET stock = stock - $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND stock >= $2 RETURNING *',
      [id, quantity]
    );
    return result.rows[0] ? Product.fromJSON(result.rows[0]) : null;
  }

  async addStock(id, quantity) {
    const result = await this.query(
      'UPDATE products SET stock = stock + $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id, quantity]
    );
    return result.rows[0] ? Product.fromJSON(result.rows[0]) : null;
  }

  async create(productData) {
    const result = await this.query(
      `INSERT INTO products (name, description, price, category_id, sku, barcode, unit, weight, dimensions, 
       stock, min_stock, max_stock, images, tags, is_visible, is_featured, discount_price, 
       discount_start_date, discount_end_date, nutrition_info, allergens, expiry_date, 
       manufacturer, country_of_origin, added_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25) RETURNING *`,
      [
        productData.name,
        productData.description,
        productData.price,
        productData.categoryId,
        productData.sku,
        productData.barcode || null,
        productData.unit || 'piece',
        productData.weight || 0,
        JSON.stringify(productData.dimensions || {}),
        productData.stock || 0,
        productData.minStock || 0,
        productData.maxStock || 1000,
        productData.images || [],
        productData.tags || [],
        productData.isVisible !== false,
        productData.isFeatured || false,
        productData.discountPrice || null,
        productData.discountStartDate || null,
        productData.discountEndDate || null,
        JSON.stringify(productData.nutritionInfo || {}),
        productData.allergens || [],
        productData.expiryDate || null,
        productData.manufacturer || '',
        productData.countryOfOrigin || '',
        productData.addedBy || null
      ]
    );
    return Product.fromJSON(result.rows[0]);
  }

  async update(id, productData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(productData).forEach(key => {
      if (productData[key] !== undefined) {
        if (key === 'dimensions' || key === 'nutritionInfo') {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(productData[key]));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(productData[key]);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    const result = await this.query(
      `UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
      [...values, id]
    );
    return result.rows[0] ? Product.fromJSON(result.rows[0]) : null;
  }

  async findById(id) {
    const result = await this.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    return result.rows[0] ? Product.fromJSON(result.rows[0]) : null;
  }

  async findAll(limit = 100, offset = 0) {
    const result = await this.query(
      'SELECT * FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows.map(row => Product.fromJSON(row));
  }
}
