import { AppDataSource } from './src/config/database';
import { User } from './src/entities/User';
import { Role } from './src/entities/Role';
import { Farm } from './src/entities/Farm';
import { FarmUser } from './src/entities/FarmUser';
import { UserStatus } from '@kuyash/shared';
import { FarmRole } from '@kuyash/shared';

async function createTestUsers() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(Role);
    const farmRepo = AppDataSource.getRepository(Farm);
    const farmUserRepo = AppDataSource.getRepository(FarmUser);

    // Get roles
    const managerRole = await roleRepo.findOne({ where: { name: 'manager' } });
    const supervisorRole = await roleRepo.findOne({ where: { name: 'supervisor' } });
    const workerRole = await roleRepo.findOne({ where: { name: 'worker' } });

    if (!managerRole || !supervisorRole || !workerRole) {
      console.log('❌ Required roles not found. Please run seed first.');
      return;
    }

    // Get the test farm
    const testFarm = await farmRepo.findOne({ where: { name: 'Test Farm' } });
    if (!testFarm) {
      console.log('❌ Test farm not found. Please create test farm first.');
      return;
    }

    // Test users data
    const testUsers = [
      {
        firstName: 'John',
        lastName: 'Manager',
        email: 'manager@test.com',
        password: 'password123',
        employeeId: 'EMP002',
        role: managerRole,
        farmRole: FarmRole.MANAGER
      },
      {
        firstName: 'Jane',
        lastName: 'Supervisor',
        email: 'supervisor@test.com',
        password: 'password123',
        employeeId: 'EMP003',
        role: supervisorRole,
        farmRole: FarmRole.WORKER
      },
      {
        firstName: 'Bob',
        lastName: 'Worker',
        email: 'worker@test.com',
        password: 'password123',
        employeeId: 'EMP004',
        role: workerRole,
        farmRole: FarmRole.WORKER
      }
    ];

    console.log('\n🔄 Creating test users...');

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await userRepo.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`✅ User ${userData.email} already exists`);
        continue;
      }

      // Create user
      const user = userRepo.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        employeeId: userData.employeeId,
        status: UserStatus.ACTIVE,
        isActive: true,
        isEmailVerified: true,
        roleId: userData.role.id
      });

      const savedUser = await userRepo.save(user);
      console.log(`✅ Created user: ${savedUser.email} (${userData.role.name})`);

      // Create farm-user relationship
      const farmUser = farmUserRepo.create({
        farmId: testFarm.id,
        userId: savedUser.id,
        role: userData.farmRole,
        isActive: true
      });

      await farmUserRepo.save(farmUser);
      console.log(`✅ Added ${savedUser.email} to farm with role: ${userData.farmRole}`);
    }

    console.log('\n🎉 Test users setup complete!');
    console.log('📋 Test Credentials:');
    console.log('   Admin: admin@kuyashfarms.com / admin123 (OWNER)');
    console.log('   Manager: manager@test.com / password123 (MANAGER)');
    console.log('   Supervisor: supervisor@test.com / password123 (WORKER)');
    console.log('   Worker: worker@test.com / password123 (WORKER)');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  createTestUsers();
}

export { createTestUsers };