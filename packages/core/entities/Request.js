import { BaseEntity } from './BaseEntity.js';

export class Request extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
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
    const validTypes = ['store_manager_approval', 'category_creation', 'category_modification'];
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
      case 'store_manager_approval':
        return this.validateStoreManagerRequestData();
      case 'category_creation':
      case 'category_modification':
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
    return this.type === 'store_manager_approval';
  }

  isCategoryRequest() {
    return this.type === 'category_creation' || this.type === 'category_modification';
  }

  isHighPriority() {
    return this.priority === 'high' || this.priority === 'urgent';
  }

  approve(reviewedBy, notes = '') {
    if (this.canBeReviewed()) {
      this.status = 'approved';
      this.reviewedBy = reviewedBy;
      this.reviewedAt = new Date();
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
      this.reviewedAt = new Date();
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
    const validTypes = ['store_manager_approval', 'category_creation', 'category_modification'];
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

  static createStoreManagerApprovalRequest(userId, requestData) {
    const request = new Request({
      type: 'store_manager_approval',
      requestedBy: userId,
      requestData: requestData
    });
    return request;
  }

  static createCategoryCreationRequest(userId, requestData) {
    const request = new Request({
      type: 'category_creation',
      requestedBy: userId,
      requestData: requestData
    });
    return request;
  }

  static createCategoryModificationRequest(userId, requestData) {
    const request = new Request({
      type: 'category_modification',
      requestedBy: userId,
      requestData: requestData
    });
    return request;
  }
}
