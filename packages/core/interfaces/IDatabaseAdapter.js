/* eslint-disable no-unused-vars */
export class IDatabaseAdapter {
  async connect() {
    throw new Error('connect() method must be implemented');
  }

  async disconnect() {
    throw new Error('disconnect() method must be implemented');
  }

  async query(_text, _params = []) {
    throw new Error('query() method must be implemented');
  }

  async findById(_collection, _id) {
    throw new Error('findById() method must be implemented');
  }

  async findAll(_collection, _filters = {}, _limit = 100, _offset = 0) {
    throw new Error('findAll() method must be implemented');
  }

  async create(_collection, _data) {
    throw new Error('create() method must be implemented');
  }

  async update(_collection, _id, _data) {
    throw new Error('update() method must be implemented');
  }

  async delete(_collection, _id) {
    throw new Error('delete() method must be implemented');
  }

  async count(_collection, _filters = {}) {
    throw new Error('count() method must be implemented');
  }
}
