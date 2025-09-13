import { BaseEntity } from './BaseEntity.js';

export class Request extends BaseEntity {
  constructor(data = {}, clock = null) {
    super(data.id, clock);
    this.type = data.type || '';
    this.status = data.status || 'pending';
    this.requestedBy = data.requestedBy || null;
    this.reviewedBy = data.reviewedBy || null;
    this.reviewedAt = data.reviewedAt || null;
    this.rejectionReason = data.rejectionReason || null;
    this.requestData = data.requestData || {};
    this.priority = data.priority || 'normal';
    this.notes = data.notes || '';
  }

  isValid() {
    return this.validateType() &&
      this.validateStatus() &&
      this.validateRequestedBy() &&
      this.validateRequestData();
  }

  validateType() {
    const validTypes = ['account_register_request', 'category_add_request', 'category_update_request', 'category_delete_request'];
    return validTypes.includes(this.type);
  }

  validateStatus() {
    const validStatuses = ['pending', 'approved', 'rejected'];
    return validStatuses.includes(this.status);
  }

  validateRequestedBy() {
    return this.requestedBy !== null;
  }

  validateRequestData() {
    switch (this.type) {
      case 'account_register_request':
        return this.validateStoreManagerRequestData();
      case 'category_add_request':
      case 'category_update_request':
      case 'category_delete_request':
        return this.validateCategoryRequestData();
      default:
        return true;
    }
  }

  validateStoreManagerRequestData() {
    const required = ['name', 'email', 'phone', 'storeName', 'storeAddress'];
    return required.every(field => this.requestData[field]);
  }

  validateCategoryRequestData() {
    const required = ['name', 'description'];
    return required.every(field => this.requestData[field]);
  }

  isPending() {
    return this.status === 'pending';
  }

  isApproved() {
    return this.status === 'approved';
  }

  isRejected() {
    return this.status === 'rejected';
  }

  canBeReviewed() {
    return this.isPending();
  }

  isStoreManagerApprovalRequest() {
    return this.type === 'account_register_request';
  }

  isCategoryRequest() {
    return this.type === 'category_add_request' || this.type === 'category_update_request' || this.type === 'category_delete_request';
  }

  isHighPriority() {
    return this.priority === 'high' || this.priority === 'urgent';
  }

  approve(reviewedBy, notes = '') {
    if (this.canBeReviewed()) {
      this.status = 'approved';
      this.reviewedBy = reviewedBy;
      this.reviewedAt = this.clock.now();
      this.notes = notes;
      this.updateTimestamp();
      return true;
    }
    return false;
  }

  reject(reviewedBy, reason = '', notes = '') {
    if (this.canBeReviewed()) {
      this.status = 'rejected';
      this.reviewedBy = reviewedBy;
      this.reviewedAt = this.clock.now();
      this.rejectionReason = reason;
      this.notes = notes;
      this.updateTimestamp();
      return true;
    }
    return false;
  }

  setPriority(priority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (validPriorities.includes(priority)) {
      this.priority = priority;
      this.updateTimestamp();
    }
    return this;
  }

  addNote(note) {
    if (note) {
      this.notes = this.notes ? `${this.notes}\n${note}` : note;
      this.updateTimestamp();
    }
    return this;
  }

  // Getters
  getType() {
    return this.type;
  }

  getStatus() {
    return this.status;
  }

  getRequestedBy() {
    return this.requestedBy;
  }

  getReviewedBy() {
    return this.reviewedBy;
  }

  getReviewedAt() {
    return this.reviewedAt;
  }

  getRejectionReason() {
    return this.rejectionReason;
  }

  getRequestData() {
    return this.requestData;
  }

  getPriority() {
    return this.priority;
  }

  getNotes() {
    return this.notes;
  }

  // Setters
  setType(type) {
    const validTypes = ['account_register_request', 'category_add_request', 'category_update_request', 'category_delete_request'];
    if (validTypes.includes(type)) {
      this.type = type;
      this.updateTimestamp();
    }
    return this;
  }

  setRequestedBy(userId) {
    this.requestedBy = userId;
    this.updateTimestamp();
    return this;
  }

  setRequestData(data) {
    this.requestData = data || {};
    this.updateTimestamp();
    return this;
  }

  setNotes(notes) {
    this.notes = notes;
    this.updateTimestamp();
    return this;
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      type: this.type,
      status: this.status,
      requestedBy: this.requestedBy,
      reviewedBy: this.reviewedBy,
      reviewedAt: this.reviewedAt,
      rejectionReason: this.rejectionReason,
      requestData: this.requestData,
      priority: this.priority,
      notes: this.notes
    };
  }

  toPersistence() {
    return this.toJSON();
  }

  static fromJSON(data) {
    return new Request(data);
  }

  static createAccountRegisterRequest(userId, requestData) {
    const request = new Request({
      type: 'account_register_request',
      requestedBy: userId,
      requestData: requestData
    });
    return request;
  }

  static createCategoryAddRequest(userId, requestData) {
    const request = new Request({
      type: 'category_add_request',
      requestedBy: userId,
      requestData: requestData
    });
    return request;
  }

  static createCategoryUpdateRequest(userId, requestData) {
    const request = new Request({
      type: 'category_update_request',
      requestedBy: userId,
      requestData: requestData
    });
    return request;
  }

  static createCategoryDeleteRequest(userId, requestData) {
    const request = new Request({
      type: 'category_delete_request',
      requestedBy: userId,
      requestData: requestData
    });
    return request;
  }
}
