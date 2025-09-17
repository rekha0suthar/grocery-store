import { db } from '../config/firebase.js';
import { IDatabaseAdapter } from '@grocery-store/core/interfaces';

export class FirebaseAdapter extends IDatabaseAdapter {
  constructor() {
    super();
    this.db = db;
  }

  // Helper method to convert Firestore timestamps to JavaScript Date objects
  convertTimestamps(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const converted = { ...data };
    
    // Convert Firestore timestamp objects to JavaScript Date objects
    Object.keys(converted).forEach(key => {
      const value = converted[key];
      
      if (value && typeof value === 'object' && value._seconds !== undefined && value._nanoseconds !== undefined) {
        // This is a Firestore timestamp
        converted[key] = new Date(value._seconds * 1000 + value._nanoseconds / 1000000);
      } else if (Array.isArray(value)) {
        // Handle arrays (like items in orders)
        converted[key] = value.map(item => this.convertTimestamps(item));
      } else if (value && typeof value === 'object') {
        // Handle nested objects (like shippingAddress, billingAddress)
        converted[key] = this.convertTimestamps(value);
      }
    });
    
    return converted;
  }

  async connect() {
    return this.db;
  }

  async disconnect() {
    return true;
  }

  async query(text, params = []) {
    throw new Error('Firebase does not support SQL queries. Use collection methods instead.');
  }

  async findById(collection, id) {
    try {
      const doc = await this.db.collection(collection).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      const data = {
        id: doc.id,
        ...doc.data()
      };
      
      return this.convertTimestamps(data);
    } catch (error) {
      throw new Error(`Failed to find document by ID: ${error.message}`);
    }
  }

  async findAll(collection, filters = {}, limit = 100, offset = 0) {
    try {
      let query = this.db.collection(collection);

      // Apply filters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined) {
          query = query.where(key, '==', filters[key]);
        }
      });

      // For now, let's avoid orderBy to prevent index requirements
      // We'll get more documents and handle sorting/pagination in memory
      const maxLimit = Math.max(limit + offset, 1000);
      query = query.limit(maxLimit);

      const snapshot = await query.get();
      const documents = [];

      snapshot.forEach(doc => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Convert timestamps for all documents
      const convertedDocuments = documents.map(doc => this.convertTimestamps(doc));

      // Sort by created_at in memory and apply offset
      convertedDocuments.sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime; // desc order
      });

      // Apply offset and limit
      return convertedDocuments.slice(offset, offset + limit);
    } catch (error) {
      throw new Error(`Failed to find documents: ${error.message}`);
    }
  }

  async create(collection, data) {
    try {
      // Remove id from data since Firestore manages document IDs
      const { id, ...dataWithoutId } = data;
      
      const docRef = await this.db.collection(collection).add({
        ...dataWithoutId
      });
      
      const result = {
        ...dataWithoutId,
        id: docRef.id
      };
      
      return this.convertTimestamps(result);
    } catch (error) {
      throw new Error(`Failed to create document: ${error.message}`);
    }
  }

  async update(collection, id, data) {
    try {
      const docRef = this.db.collection(collection).doc(id);
      
      await docRef.update({
        ...data
      });
      
      const updatedDoc = await docRef.get();
      const result = {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
      
      return this.convertTimestamps(result);
    } catch (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }
  }

  async delete(collection, id) {
    try {
      await this.db.collection(collection).doc(id).delete();
      return { id, deleted: true };
    } catch (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  async count(collection, filters = {}) {
    try {
      let query = this.db.collection(collection);

      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined) {
          query = query.where(key, '==', filters[key]);
        }
      });

      const snapshot = await query.get();
      return snapshot.size;
    } catch (error) {
      throw new Error(`Failed to count documents: ${error.message}`);
    }
  }

  async findByField(collection, field, value) {
    try {
      const snapshot = await this.db.collection(collection)
        .where(field, '==', value)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = {
        id: doc.id,
        ...doc.data()
      };
      
      return this.convertTimestamps(data);
    } catch (error) {
      throw new Error(`Failed to find document by field: ${error.message}`);
    }
  }
}
