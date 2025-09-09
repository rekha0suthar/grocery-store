import { BaseRepository } from './BaseRepository.js';
import { Request } from '@grocery-store/core/entities';
import { DatabaseFactory } from '../factories/DatabaseFactory.js';

export class RequestRepository extends BaseRepository {
  constructor(databaseTypeOrAdapter = 'firebase') {
    let adapter;
    if (typeof databaseTypeOrAdapter === 'string') {
      adapter = DatabaseFactory.createAdapter(databaseTypeOrAdapter);
    } else {
      adapter = databaseTypeOrAdapter;
    }
    super('requests', adapter);
  }

  async findByUserAndType(userId, type, status = null) {
    const filters = { requestedBy: userId, type };
    if (status) {
      filters.status = status;
    }
    const result = await this.findByField('requestedBy', userId);
    if (result && result.type === type && (!status || result.status === status)) {
      return Request.fromJSON(result);
    }
    return null;
  }

  async findByType(type) {
    const requests = await this.findAll({ type });
    return requests;
  }

  async findByStatus(status) {
    const requests = await this.findAll({ status });
    return requests;
  }

  async findPending() {
    const requests = await this.findAll({ status: 'pending' });
    return requests;
  }

  async findByRequester(userId) {
    const requests = await this.findAll({ requestedBy: userId });
    return requests;
  }

  async findByReviewer(reviewerId) {
    const requests = await this.findAll({ reviewedBy: reviewerId });
    return requests;
  }

  async findByPriority(priority) {
    const requests = await this.findAll({ priority });
    return requests;
  }

  async countByType(type) {
    return await this.db.count('requests', { type });
  }

  async countByStatus(status) {
    return await this.db.count('requests', { status });
  }

  async countPending() {
    return await this.db.count('requests', { status: 'pending' });
  }

  async create(requestData) {
    const request = new Request(requestData);
    const result = await super.create(request.toPersistence());
    return Request.fromJSON(result);
  }

  async update(id, requestData) {
    const result = await super.update(id, requestData);
    return result ? Request.fromJSON(result) : null;
  }

  async findById(id) {
    const result = await super.findById(id);
    return result ? Request.fromJSON(result) : null;
  }

  async findAll(filters = {}) {
    const results = await super.findAll(filters);
    return results.map(request => Request.fromJSON(request));
  }
}
