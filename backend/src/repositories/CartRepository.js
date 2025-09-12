import { BaseRepository } from './BaseRepository.js';
import { Cart } from '@grocery-store/core/entities';

export class CartRepository extends BaseRepository {
  constructor(databaseAdapter) {
    super('carts', databaseAdapter);
  }

  async create(cartData) {
    const cart = new Cart(cartData);
    const result = await this.db.create(this.collectionName, cart.toJSON());
    return Cart.fromJSON(result);
  }

  async findById(id) {
    const result = await this.db.findById(this.collectionName, id);
    return result ? Cart.fromJSON(result) : null;
  }

  async findByUserId(userId) {
    const result = await this.db.findByField(this.collectionName, 'userId', userId);
    return result ? Cart.fromJSON(result) : null;
  }

  async update(id, cartData) {
    const result = await this.db.update(this.collectionName, id, cartData);
    return result ? Cart.fromJSON(result) : null;
  }

  async clear(id) {
    const result = await this.db.update(this.collectionName, id, { 
      items: [], 
      totalItems: 0, 
      totalPrice: 0,
      updatedAt: new Date().toISOString()
    });
    return result ? Cart.fromJSON(result) : null;
  }

  async delete(id) {
    return await this.db.delete(this.collectionName, id);
  }
} 
