// packages/core/use-cases/auth/UpdateUserUseCase.js
import { User } from '../../entities/User.js';
import { validateUserProfile } from '../../contracts/user.validation.js';

export class UpdateUserUseCase {
  /**
   * @param {{ userRepo: { findById(id): Promise<User|Object>, update(id, data): Promise<Object> } }} deps
   */
  constructor({ userRepo }) {
    this.userRepository = userRepo;
  }

  async execute(userId, updateData) {
    console.log('UpdateUserUseCase: Starting update for userId:', userId);
    console.log('UpdateUserUseCase: updateData:', updateData);
    
    if (!userId) {
      return { success: false, message: 'User ID is required', user: null };
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      return { success: false, message: 'Update data is required', user: null };
    }

    const existing = await this.userRepository.findById(userId);
    if (!existing) {
      return { success: false, message: 'User not found', user: null };
    }

    console.log('UpdateUserUseCase: existing user:', existing);

    // Normalize to plain object if entity-like
    const existingPlain =
      typeof existing.toJSON === 'function'
        ? existing.toJSON()
        : (existing.toPublicJSON?.() ?? existing);

    console.log('UpdateUserUseCase: existingPlain:', existingPlain);

    // ✅ Merge BEFORE validation so required fields (like email) come from existing record
    const merged = {
      ...existingPlain,
      ...updateData,
      id: userId,
      updatedAt: new Date().toISOString(),
    };

    console.log('UpdateUserUseCase: merged data:', merged);

    // If your validator supports modes, pass { mode: 'update' }; otherwise just validate merged
    const validation = validateUserProfile(merged /*, { mode: 'update' }*/);
    console.log('UpdateUserUseCase: validation result:', validation);
    
    if (!validation.isValid) {
      return { success: false, message: Object.values(validation.errors).join(', '), user: null };
    }

    const userEntity = new User(merged);
    console.log('UpdateUserUseCase: userEntity created:', userEntity);
    console.log('UpdateUserUseCase: userEntity.isValid():', userEntity.isValid());
    
    if (!userEntity.isValid()) {
      return { success: false, message: 'Invalid user data after update', user: null };
    }

    const persisted = await this.userRepository.update(userId, userEntity.toPersistence());
    console.log('UpdateUserUseCase: persisted user:', persisted);
    
    return {
      success: true,
      message: 'User updated successfully',
      user: User.fromJSON(persisted).toPublicJSON(),
    };
  }
}
