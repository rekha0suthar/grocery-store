import { BaseRepository } from './BaseRepository.js';
import { StoreManagerProfile } from '@grocery-store/core/entities/StoreManagerProfile.js';
import { DatabaseFactory } from '../factories/DatabaseFactory.js';
import { DefaultClock } from '@grocery-store/core/adapters/DefaultClock.js';

export class StoreManagerProfileRepository extends BaseRepository {
  constructor(databaseTypeOrAdapter = 'firebase') {
    let adapter;
    if (typeof databaseTypeOrAdapter === 'string') {
      adapter = DatabaseFactory.createAdapter(databaseTypeOrAdapter);
    } else {
      adapter = databaseTypeOrAdapter;
    }
    super('store_manager_profiles', adapter);
    this.clock = new DefaultClock();
  }

  async findByUserId(userId) {
    try {
      const profiles = await this.database.query(this.collectionName, 'userId', '==', userId);
      if (profiles.length === 0) return null;
      
      return new StoreManagerProfile(profiles[0], this.clock);
    } catch (error) {
      console.error('Error finding store manager profile by user ID:', error);
      throw error;
    }
  }

  async findApproved() {
    try {
      const profiles = await this.database.query(this.collectionName, 'isApproved', '==', true);
      return profiles.map(profile => new StoreManagerProfile(profile, this.clock));
    } catch (error) {
      console.error('Error finding approved store manager profiles:', error);
      throw error;
    }
  }

  async findPending() {
    try {
      const profiles = await this.database.query(this.collectionName, 'isApproved', '==', false);
      return profiles.map(profile => new StoreManagerProfile(profile, this.clock));
    } catch (error) {
      console.error('Error finding pending store manager profiles:', error);
      throw error;
    }
  }

  async save(profile) {
    try {
      const profileData = profile.toPersistence();
      
      if (profile.id) {
        await this.database.update(this.collectionName, profile.id, profileData);
      } else {
        const id = await this.database.create(this.collectionName, profileData);
        profile.id = id;
      }
      
      return profile;
    } catch (error) {
      console.error('Error saving store manager profile:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const profileData = await this.database.findById(this.collectionName, id);
      if (!profileData) return null;
      
      return new StoreManagerProfile(profileData, this.clock);
    } catch (error) {
      console.error('Error finding store manager profile by ID:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.database.delete(this.collectionName, id);
      return true;
    } catch (error) {
      console.error('Error deleting store manager profile:', error);
      throw error;
    }
  }

  async findAll(limit = 20, offset = 0) {
    try {
      const profiles = await this.database.findAll(this.collectionName, limit, offset);
      return profiles.map(profile => new StoreManagerProfile(profile, this.clock));
    } catch (error) {
      console.error('Error finding all store manager profiles:', error);
      throw error;
    }
  }

  async count() {
    try {
      return await this.database.count(this.collectionName);
    } catch (error) {
      console.error('Error counting store manager profiles:', error);
      throw error;
    }
  }
}
