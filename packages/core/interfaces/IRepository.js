/* eslint-disable no-unused-vars */
export class IRepository {

  async create(_entity) {
    throw new Error('create method must be implemented');
  }

  async findById(_id) {
    throw new Error('findById method must be implemented');
  }

  async findAll(_filters = {}, _options = {}) {
    throw new Error('findAll method must be implemented');
  }

  async update(_id, _updates) {
    throw new Error('update method must be implemented');
  }

  async delete(_id) {
    throw new Error('delete method must be implemented');
  }

  async count(_filters = {}) {
    throw new Error('count method must be implemented');
  }

  async exists(_id) {
    throw new Error('exists method must be implemented');
  }
}
