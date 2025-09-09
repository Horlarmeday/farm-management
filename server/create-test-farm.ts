import { AppDataSource } from './src/config/database';
import { Farm } from './src/entities/Farm';
import { FarmUser } from './src/entities/FarmUser';
import { User } from './src/entities/User';
import { FarmRole } from '@kuyash/shared';

async function createTestFarm() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepo = AppDataSource.getRepository(User);
    const farmRepo = AppDataSource.getRepository(Farm);
    const farmUserRepo = AppDataSource.getRepository(FarmUser);

    // Find the admin user
    const adminUser = await userRepo.findOne({
      where: { email: 'admin@kuyashfarms.com' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found. Please run seed first.');
      return;
    }

    console.log('✅ Found admin user:', adminUser.email);

    // Check if farm already exists
    const existingFarm = await farmRepo.findOne({
      where: { name: 'Test Farm' }
    });

    if (existingFarm) {
      console.log('✅ Test farm already exists:', existingFarm.name);
      return;
    }

    // Create test farm
    const testFarm = farmRepo.create({
      name: 'Test Farm',
      description: 'A test farm for UI testing',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      postalCode: '12345',
      phone: '+1234567890',
      email: 'testfarm@example.com',
      ownerId: adminUser.id,
      isActive: true
    });

    const savedFarm = await farmRepo.save(testFarm);
    console.log('✅ Created test farm:', savedFarm.name);

    // Create farm-user relationship
    const farmUser = farmUserRepo.create({
      farmId: savedFarm.id,
      userId: adminUser.id,
      role: FarmRole.OWNER,
      isActive: true
    });

    await farmUserRepo.save(farmUser);
    console.log('✅ Created farm-user relationship with OWNER role');

    console.log('\n🎉 Test farm setup complete!');
    console.log('📋 Farm Details:');
    console.log(`   Name: ${savedFarm.name}`);
    console.log(`   ID: ${savedFarm.id}`);
    console.log(`   Owner: ${adminUser.email}`);
    console.log(`   Role: ${FarmRole.OWNER}`);

  } catch (error) {
    console.error('❌ Error creating test farm:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  createTestFarm();
}

export { createTestFarm };