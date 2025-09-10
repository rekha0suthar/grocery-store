/* eslint-disable no-unused-vars */
import { IRepository } from './IRepository.js';

export class IProductRepository extends IRepository {
  async findByCategory(_categoryId) {
    throw new Error('findByCategory method must be implemented');
  }

  async findBySku(_sku) {
    throw new Error('findBySku method must be implemented');
  }

  async findByBarcode(_barcode) {
    throw new Error('findByBarcode method must be implemented');
  }

  async findInStock() {
    throw new Error('findInStock method must be implemented');
  }

  async findLowStock() {
    throw new Error('findLowStock method must be implemented');
  }

  async findByPriceRange(_minPrice, _maxPrice) {
    throw new Error('findByPriceRange method must be implemented');
  }

  async findFeatured() {
    throw new Error('findFeatured method must be implemented');
  }

  async findOnDiscount() {
    throw new Error('findOnDiscount method must be implemented');
  }

  async search(_searchTerm) {
    throw new Error('search method must be implemented');
  }

  async findByTags(_tags) {
    throw new Error('findByTags method must be implemented');
  }

  async findByManufacturer(_manufacturer) {
    throw new Error('findByManufacturer method must be implemented');
  }

  async updateStock(_id, _quantity) {
    throw new Error('updateStock method must be implemented');
  }

  async findByAddedBy(_userId) {
    throw new Error('findByAddedBy method must be implemented');
  }

  async findByVisibility(_isVisible) {
    throw new Error('findByVisibility method must be implemented');
  }

  async findExpiringSoon(_days = 7) {
    throw new Error('findExpiringSoon method must be implemented');
  }

  async findExpired() {
    throw new Error('findExpired method must be implemented');
  }
}
