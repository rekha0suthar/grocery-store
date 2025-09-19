import { db } from '../config/firebase.js';
import { IDatabaseAdapter } from '@grocery-store/core/interfaces';

export class FirebaseAdapter extends IDatabaseAdapter {
  constructor() {
    super();
    this.db = db;
    // Simple in-memory cache to reduce Firebase calls
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
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

  // Cache management methods
  getCacheKey(collection, filters, limit, cursor) {
    return `${collection}_${JSON.stringify(filters)}_${limit}_${cursor || 'first'}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Quota-friendly cursor-based pagination
  async findAllWithCursor(collection, options = {}) {
    const {
      filters = {},
      pageSize = 5,
      cursor = null,
      orderByField = 'createdAt',
      orderDirection = 'desc'
    } = options;

    try {
      const cacheKey = this.getCacheKey(collection, filters, pageSize, cursor?.id);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log(`Cache hit for ${collection}`);
        return cached;
      }

      // Use Admin SDK methods
      let query = this.db.collection(collection);
      
      // Apply filters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined) {
          query = query.where(key, '==', filters[key]);
        }
      });

      // Apply ordering
      query = query.orderBy(orderByField, orderDirection);

      // Apply cursor for pagination
      if (cursor) {
        query = query.startAfter(cursor);
      }

      // Get one extra document to check if there's a next page
      const snapshot = await query.limit(pageSize + 1).get();
      
      const docs = snapshot.docs.slice(0, pageSize); // Remove the extra doc
      const hasNext = snapshot.docs.length > pageSize;
      const lastDoc = docs[docs.length - 1] || null;

      const result = {
        items: docs.map(doc => this.convertTimestamps({
          id: doc.id,
          ...doc.data()
        })),
        hasNext,
        hasPrev: cursor !== null,
        lastDoc,
        total: 0, // We don't count total to save quota
        quotaExceeded: false
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error(`${collection} retrieval error:`, error);
      
      // Handle quota exceeded errors gracefully
      if (error.code === 8 || error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('quota')) {
        console.warn('Firebase quota exceeded, returning cached data if available');
        const cacheKey = this.getCacheKey(collection, filters, pageSize, cursor?.id);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          return {
            ...cached,
            quotaExceeded: true,
            error: 'Using cached data due to quota limits'
          };
        }
        
        return {
          items: [],
          hasNext: false,
          hasPrev: false,
          lastDoc: null,
          total: 0,
          quotaExceeded: true,
          error: 'Firebase quota exceeded. Please try again later.'
        };
      }
      
      throw new Error(`Failed to find documents: ${error.message}`);
    }
  }

  // Legacy method - now uses cursor-based pagination internally
  async findAll(collection, filters = {}, limit = 100, offset = 0) {
    console.warn('Using legacy offset-based pagination. Consider migrating to cursor-based pagination.');
    
    // For backward compatibility, we'll still support offset but with a warning
    // and reduced quota usage
    try {
      const result = await this.findAllWithCursor(collection, {
        filters,
        limit: Math.min(limit, 20), // Cap at 20 to reduce quota usage
        cursor: null
      });
      
      // Return just the items array for backward compatibility
      return result.items || [];
    } catch (error) {
      console.error(`Error in findAll for ${collection}:`, error);
      throw error;
    }
  }

  async findById(collection, id) {
    try {
      const doc = await this.db.collection(collection).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return this.convertTimestamps({
        id: doc.id,
        ...doc.data()
      });
    } catch (error) {
      console.error(`Error finding document in ${collection}:`, error);
      throw new Error(`Failed to find document: ${error.message}`);
    }
  }

  async create(collection, data) {
    try {
      const docRef = await this.db.collection(collection).add(data);
      
      // Clear cache for this collection
      this.clearCollectionCache(collection);
      
      return {
        id: docRef.id,
        ...data
      };
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error);
      throw new Error(`Failed to create document: ${error.message}`);
    }
  }

  async update(collection, id, data) {
    try {
      await this.db.collection(collection).doc(id).update(data);
      
      // Clear cache for this collection
      this.clearCollectionCache(collection);
      
      return {
        id,
        ...data
      };
    } catch (error) {
      console.error(`Error updating document in ${collection}:`, error);
      throw new Error(`Failed to update document: ${error.message}`);
    }
  }

  async delete(collection, id) {
    try {
      await this.db.collection(collection).doc(id).delete();
      
      // Clear cache for this collection
      this.clearCollectionCache(collection);
      
      return { id };
    } catch (error) {
      console.error(`Error deleting document in ${collection}:`, error);
      throw new Error(`Failed to delete document: ${error.message}`);
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
      return this.convertTimestamps({
        id: doc.id,
        ...doc.data()
      });
    } catch (error) {
      console.error(`Error finding document by field in ${collection}:`, error);
      throw new Error(`Failed to find document by field: ${error.message}`);
    }
  }

  async count(collection, filters = {}) {
    console.warn('Count queries are expensive. Consider using cursor-based pagination instead.');
    
    try {
      let query = this.db.collection(collection);
      
      // Apply filters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined) {
          query = query.where(key, '==', filters[key]);
        }
      });
      
      const snapshot = await query.get();
      return snapshot.size;
    } catch (error) {
      console.error(`Error counting documents in ${collection}:`, error);
      throw new Error(`Failed to count documents: ${error.message}`);
    }
  }

  // Helper method to clear cache for a specific collection
  clearCollectionCache(collection) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(collection + '_')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }
  // Enhanced pagination methods for specific collections
  async findProductsWithCursor(options = {}) {
    const {
      filters = {},
      pageSize = 12,
      cursor = null,
      orderByField = 'createdAt',
      orderDirection = 'desc'
    } = options;

    // Map common product filters to proper field names
    const mappedFilters = {};
    if (filters.categoryId) mappedFilters.categoryId = filters.categoryId;
    if (filters.isActive !== undefined) mappedFilters.isActive = filters.isActive;
    if (filters.isFeatured !== undefined) mappedFilters.isFeatured = filters.isFeatured;

    return this.findAllWithCursor('products', {
      filters: mappedFilters,
      pageSize,
      cursor,
      orderByField,
      orderDirection
    });
  }

  async findCategoriesWithCursor(options = {}) {
    const {
      filters = {},
      pageSize = 12,
      cursor = null,
      orderByField = 'createdAt',
      orderDirection = 'desc'
    } = options;

    // Map common category filters
    const mappedFilters = {};
    if (filters.isActive !== undefined) mappedFilters.isActive = filters.isActive;
    if (filters.parentId !== undefined) mappedFilters.parentId = filters.parentId;

    return this.findAllWithCursor('categories', {
      filters: mappedFilters,
      pageSize,
      cursor,
      orderByField,
      orderDirection
    });
  }

  // Optimized search with cursor pagination
  async searchWithCursor(collection, searchField, searchTerm, options = {}) {
    const {
      pageSize = 12,
      cursor = null,
      orderByField = 'createdAt',
      orderDirection = 'desc'
    } = options;

    try {
      const cacheKey = this.getCacheKey(collection, { search: searchTerm }, pageSize, cursor?.id);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log(`Search cache hit for ${collection}`);
        return cached;
      }

      let query = this.db.collection(collection);
      
      // Simple text search using range queries for names
      if (searchField === 'name') {
        query = query
          .where('name', '>=', searchTerm)
          .where('name', '<=', searchTerm + '\uf8ff');
      }

      query = query.orderBy(orderByField, orderDirection);

      if (cursor) {
        query = query.startAfter(cursor);
      }

      const snapshot = await query.limit(pageSize + 1).get();
      const docs = snapshot.docs.slice(0, pageSize);
      const hasNext = snapshot.docs.length > pageSize;
      const lastDoc = docs[docs.length - 1] || null;

      const result = {
        items: docs.map(doc => this.convertTimestamps({
          id: doc.id,
          ...doc.data()
        })),
        hasNext,
        hasPrev: cursor !== null,
        lastDoc,
        total: 0,
        quotaExceeded: false
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error(`Search error in ${collection}:`, error);
      
      if (error.code === 8 || error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('quota')) {
        return {
          items: [],
          hasNext: false,
          hasPrev: false,
          lastDoc: null,
          total: 0,
          quotaExceeded: true,
          error: 'Search quota exceeded. Please try again later.'
        };
      }
      
      throw new Error(`Search failed: ${error.message}`);
    }
  }


  async connect() {
    try {
      // Test connection
      await this.db.collection('_test').limit(1).get();
      console.log('✅ Firebase connection established');
      return true;
    } catch (error) {
      console.error('❌ Firebase connection failed:', error);
      return false;
    }
  }

  async disconnect() {
    // Firebase Admin SDK doesn't require explicit disconnection
    console.log('✅ Firebase connection closed');
    return true;
  }
}


