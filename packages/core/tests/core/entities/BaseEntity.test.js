import { BaseEntity } from '../../../entities/BaseEntity.js';

describe('BaseEntity - Core Domain Rules', () => {
  let entity;

  beforeEach(() => {
    entity = new BaseEntity();
  });

  describe('Creation Invariants', () => {
    test('creates entity with default values', () => {
      expect(entity.id).toBeNull();
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
      expect(entity.isActive).toBe(true);
    });

    test('creates entity with provided id', () => {
      const testId = 'test-id-123';
      const entityWithId = new BaseEntity(testId);
      expect(entityWithId.id).toBe(testId);
    });

    test('sets timestamps on creation', () => {
      const beforeCreation = new Date();
      const newEntity = new BaseEntity();
      const afterCreation = new Date();

      expect(newEntity.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(newEntity.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });
  });

  describe('State Transitions - Deterministic', () => {
    test('activates entity with explicit time', () => {
      const t0 = new Date('2024-01-01T00:00:00Z');
      const t1 = new Date('2024-01-01T00:00:01Z');
      
      entity.deactivate(t0);
      expect(entity.isActive).toBe(false);
      expect(entity.updatedAt).toEqual(t0);
      
      entity.activate(t1);
      expect(entity.isActive).toBe(true);
      expect(entity.updatedAt).toEqual(t1);
    });

    test('deactivates entity with explicit time', () => {
      const t1 = new Date('2024-01-01T00:00:01Z');
      entity.deactivate(t1);
      
      expect(entity.isActive).toBe(false);
      expect(entity.updatedAt).toEqual(t1);
    });

    test('updates timestamp with explicit time', () => {
      const t1 = new Date('2024-01-01T00:00:01Z');
      entity.updateTimestamp(t1);
      
      expect(entity.updatedAt).toEqual(t1);
    });
  });

  describe('Date-safe JSON Serialization', () => {
    test('rehydrates dates correctly from JSON', () => {
      const testData = {
        id: 'from-json-id',
        createdAt: '2023-01-01T10:00:00.000Z',
        updatedAt: '2023-01-02T10:00:00.000Z',
        isActive: false
      };
      
      const entityFromJson = BaseEntity.fromJSON(testData);
      
      expect(entityFromJson.id).toBe('from-json-id');
      expect(entityFromJson.createdAt).toBeInstanceOf(Date);
      expect(entityFromJson.updatedAt).toBeInstanceOf(Date);
      expect(entityFromJson.createdAt.toISOString()).toBe('2023-01-01T10:00:00.000Z');
      expect(entityFromJson.updatedAt.toISOString()).toBe('2023-01-02T10:00:00.000Z');
      expect(entityFromJson.isActive).toBe(false);
    });

    test('handles missing dates in JSON', () => {
      const testData = { id: 'test-id' };
      const entityFromJson = BaseEntity.fromJSON(testData);
      
      expect(entityFromJson.createdAt).toBeInstanceOf(Date);
      expect(entityFromJson.updatedAt).toBeInstanceOf(Date);
      expect(entityFromJson.isActive).toBe(true);
    });

    test('handles malformed date strings gracefully', () => {
      const testData = {
        id: 'test-id',
        createdAt: 'invalid-date',
        updatedAt: '2023-01-01T10:00:00.000Z'
      };
      
      const entityFromJson = BaseEntity.fromJSON(testData);
      
      // Should fallback to new Date() for invalid dates
      expect(entityFromJson.createdAt).toBeInstanceOf(Date);
      expect(entityFromJson.updatedAt).toBeInstanceOf(Date);
      expect(entityFromJson.updatedAt.toISOString()).toBe('2023-01-01T10:00:00.000Z');
    });
  });

  describe('Entity Lifecycle', () => {
    test('maintains data integrity through serialization cycle', () => {
      const testId = 'lifecycle-test';
      const t1 = new Date('2024-01-01T00:00:01Z');
      
      entity.setId(testId);
      entity.deactivate(t1);
      
      const json = entity.toJSON();
      const restoredEntity = BaseEntity.fromJSON(json);
      
      expect(restoredEntity.id).toBe(testId);
      expect(restoredEntity.isActive).toBe(false);
      expect(restoredEntity.createdAt).toEqual(entity.createdAt);
      expect(restoredEntity.updatedAt).toEqual(entity.updatedAt);
    });
  });
});
