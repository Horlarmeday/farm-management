const { AppDataSource } = require('./dist/config/database');
const { User } = require('./dist/entities/User');
const bcrypt = require('bcryptjs');

async function debugUser() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');
    
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { email: 'admin@kuyashfarms.com' },
      select: ['id', 'email', 'firstName', 'lastName', 'password'],
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      passwordLength: user.password?.length,
    });
    
    // Test password comparison
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('Password comparison result:', isValid);
    
    // Test if password is double hashed
    const directHash = await bcrypt.hash(testPassword, 12);
    const isDirectValid = await bcrypt.compare(testPassword, directHash);
    console.log('Direct hash comparison:', isDirectValid);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

debugUser();