import { BaseEntity } from './BaseEntity.js';

export class StoreManagerProfile extends BaseEntity {
  constructor(data = {}, clock = null) {
    super(data.id, clock);
    this.userId = data.userId;
    this.isApproved = data.isApproved || false;
    this.approvedAt = data.approvedAt || null;
    this.approvedBy = data.approvedBy || null;
    this.storeName = data.storeName || '';
    this.storeAddress = data.storeAddress || '';
    this.notes = data.notes || '';
  }

  approve(approvedBy) {
    if (this.isApproved) {
      throw new Error('Store manager is already approved');
    }
    
    this.isApproved = true;
    this.approvedAt = this.clock.now();
    this.approvedBy = approvedBy;
    this.updateTimestamp();
  }

  revokeApproval() {
    if (!this.isApproved) {
      throw new Error('Store manager is not approved');
    }
    
    this.isApproved = false;
    this.approvedAt = null;
    this.approvedBy = null;
    this.updateTimestamp();
  }

  canLogin() {
    return this.isApproved;
  }

  needsApproval() {
    return !this.isApproved;
  }

  updateStoreInfo(storeData) {
    if (storeData.storeName) {
      this.storeName = storeData.storeName;
    }
    if (storeData.storeAddress) {
      this.storeAddress = storeData.storeAddress;
    }
    this.updateTimestamp();
  }

  addNote(note) {
    if (note) {
      this.notes = this.notes ? `${this.notes}\n${note}` : note;
      this.updateTimestamp();
    }
  }

  isValid() {
    return this.userId && typeof this.userId === 'string';
  }

  toJSON() {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      userId: this.userId,
      isApproved: this.isApproved,
      approvedAt: this.approvedAt,
      approvedBy: this.approvedBy,
      storeName: this.storeName,
      storeAddress: this.storeAddress,
      notes: this.notes
    };
  }

  toPersistence() {
    return this.toJSON();
  }

  static fromJSON(data) {
    return new StoreManagerProfile(data);
  }
}
