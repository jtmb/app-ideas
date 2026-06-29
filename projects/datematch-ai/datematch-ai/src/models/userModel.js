/**
 * User Model - Represents user data in the database
 */

class UserModel {
  constructor() {
    // In production, this would connect to PostgreSQL
    // For now, we use an in-memory store for demo purposes
    this.users = new Map();
    
    // Seed with initial data
    this.seed();
  }

  seed() {
    const initialUsers = [
      {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'mock_hash',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    initialUsers.forEach(user => {
      this.users.set(user.id, user);
    });
  }

  /**
   * Find user by email
   */
  findByEmail(email) {
    return Array.from(this.users.values()).find(
      user => user.email === email
    );
  }

  /**
   * Find user by ID
   */
  findById(id) {
    return this.users.get(id);
  }

  /**
   * Create a new user
   */
  create(userData) {
    const user = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      passwordHash: userData.passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.set(user.id, user);
    return user;
  }

  /**
   * Update user data
   */
  update(id, updates) {
    const user = this.findById(id);
    if (!user) {
      return null;
    }

    user.updatedAt = new Date().toISOString();
    Object.assign(user, updates);
    this.users.set(id, user);
    return user;
  }

  /**
   * Delete a user
   */
  delete(id) {
    return this.users.delete(id);
  }

  /**
   * Get all users (for admin purposes)
   */
  getAll() {
    return Array.from(this.users.values());
  }
}

module.exports = new UserModel();