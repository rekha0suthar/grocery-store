import { BaseRepository } from './BaseRepository.js';
import { Category } from '../entities/Category.js';

export class CategoryRepository extends BaseRepository {
  constructor() {
    super('categories');
  }

  async findBySlug(slug) {
    const result = await this.query(
      'SELECT * FROM categories WHERE slug = $1',
      [slug]
    );
    return result.rows[0] ? Category.fromJSON(result.rows[0]) : null;
  }

  async findRootCategories(limit = 100, offset = 0) {
    const result = await this.query(
      'SELECT * FROM categories WHERE parent_id IS NULL AND is_visible = true ORDER BY sort_order, name LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows.map(row => Category.fromJSON(row));
  }

  async findByParent(parentId, limit = 100, offset = 0) {
    const result = await this.query(
      'SELECT * FROM categories WHERE parent_id = $1 AND is_visible = true ORDER BY sort_order, name LIMIT $2 OFFSET $3',
      [parentId, limit, offset]
    );
    return result.rows.map(row => Category.fromJSON(row));
  }

  async findVisible(limit = 100, offset = 0) {
    const result = await this.query(
      'SELECT * FROM categories WHERE is_visible = true ORDER BY sort_order, name LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows.map(row => Category.fromJSON(row));
  }

  async hasProducts(categoryId) {
    const result = await this.query(
      'SELECT EXISTS(SELECT 1 FROM products WHERE category_id = $1)',
      [categoryId]
    );
    return result.rows[0].exists;
  }

  async hasSubcategories(categoryId) {
    const result = await this.query(
      'SELECT EXISTS(SELECT 1 FROM categories WHERE parent_id = $1)',
      [categoryId]
    );
    return result.rows[0].exists;
  }

  async getCategoryTree() {
    const result = await this.query(`
      WITH RECURSIVE category_tree AS (
        SELECT id, name, description, slug, image_url, parent_id, sort_order, is_visible, 0 as level
        FROM categories 
        WHERE parent_id IS NULL AND is_visible = true
        
        UNION ALL
        
        SELECT c.id, c.name, c.description, c.slug, c.image_url, c.parent_id, c.sort_order, c.is_visible, ct.level + 1
        FROM categories c
        JOIN category_tree ct ON c.parent_id = ct.id
        WHERE c.is_visible = true
      )
      SELECT * FROM category_tree ORDER BY level, sort_order, name
    `);
    
    return result.rows.map(row => Category.fromJSON(row));
  }

  async create(categoryData) {
    const result = await this.query(
      `INSERT INTO categories (name, description, slug, image_url, parent_id, sort_order, is_visible) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        categoryData.name,
        categoryData.description,
        categoryData.slug || this.generateSlug(categoryData.name),
        categoryData.imageUrl || null,
        categoryData.parentId || null,
        categoryData.sortOrder || 0,
        categoryData.isVisible !== false
      ]
    );
    return Category.fromJSON(result.rows[0]);
  }

  async update(id, categoryData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(categoryData).forEach(key => {
      if (categoryData[key] !== undefined) {
        if (key === 'imageUrl') {
          fields.push(`image_url = $${paramCount}`);
        } else if (key === 'parentId') {
          fields.push(`parent_id = $${paramCount}`);
        } else if (key === 'sortOrder') {
          fields.push(`sort_order = $${paramCount}`);
        } else if (key === 'isVisible') {
          fields.push(`is_visible = $${paramCount}`);
        } else {
          fields.push(`${key} = $${paramCount}`);
        }
        values.push(categoryData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    const result = await this.query(
      `UPDATE categories SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
      [...values, id]
    );
    return result.rows[0] ? Category.fromJSON(result.rows[0]) : null;
  }

  async findById(id) {
    const result = await this.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    return result.rows[0] ? Category.fromJSON(result.rows[0]) : null;
  }

  async findAll(limit = 100, offset = 0) {
    const result = await this.query(
      'SELECT * FROM categories ORDER BY sort_order, name LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows.map(row => Category.fromJSON(row));
  }

  generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
