import { db } from '../config/firebase.js';
import { IDatabaseAdapter } from '@grocery-store/core/interfaces';
export class FirebaseAdapter extends IDatabaseAdapter {
  constructor() {
    super();
    this.db = db;
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

      return {
        id: doc.id,
        ...doc.data()
      };
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

      // Sort by created_at in memory and apply offset
      documents.sort((a, b) => {
        const aTime = new Date(a.created_at || 0).getTime();
        const bTime = new Date(b.created_at || 0).getTime();
        return bTime - aTime; // desc order
      });

      // Apply offset and limit
      return documents.slice(offset, offset + limit);
    } catch (error) {
      throw new Error(`Failed to find documents: ${error.message}`);
    }
  }

  async create(collection, data) {
    try {
      const docRef = await this.db.collection(collection).add({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      return {
        id: docRef.id,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to create document: ${error.message}`);
    }
  }

  async update(collection, id, data) {
    try {
      const docRef = this.db.collection(collection).doc(id);
      
      await docRef.update({
        ...data,
        updated_at: new Date().toISOString()
      });
      
      const updatedDoc = await docRef.get();
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
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
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      throw new Error(`Failed to find document by field: ${error.message}`);
    }
  }
}
