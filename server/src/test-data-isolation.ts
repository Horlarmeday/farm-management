import { AppDataSource } from './config/database';
import { Farm } from './entities/Farm';
import { FarmUser } from './entities/FarmUser';
import { User } from './entities/User';
import { Asset } from './entities/Asset';
import { Location } from './entities/Location';
import { Role } from './entities/Role';
import { FarmRole, AssetType, UserStatus } from '../../shared/src/types';
import { In } from 'typeorm';
import * as bcrypt from 'bcryptjs';

async function testDataIsolation() {
  try {
    console.log('🔄 Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    // Create or get a test role
    console.log('\n🔑 Setting up test role...');
    const roleRepo = AppDataSource.getRepository(Role);
    
    let testRole = await roleRepo.findOne({ where: { name: 'worker' } });
    if (!testRole) {
      testRole = roleRepo.create({
        name: 'test-role',
        description: 'Test role for data isolation testing',
        isActive: true,
        isSystemRole: false
      });
      await roleRepo.save(testRole);
    }
    
    // Clean up any existing test data first
     const userRepo = AppDataSource.getRepository(User);
     const farmRepo = AppDataSource.getRepository(Farm);
     const farmUserRepo = AppDataSource.getRepository(FarmUser);
     const locationRepo = AppDataSource.getRepository(Location);
     const assetRepo = AppDataSource.getRepository(Asset);
     
     // Clean up test data with proper conditions
     await assetRepo.delete({ name: In(['John Deere Tractor', 'Case IH Tractor']) });
     await locationRepo.delete({ name: In(['Farm 1 Main Location', 'Farm 2 Main Location']) });
     
     // Delete farm users for test farms
     const existingFarms = await farmRepo.find({ where: { name: In(['Green Valley Farm', 'Blue Ridge Farm']) } });
     if (existingFarms.length > 0) {
       const farmIds = existingFarms.map(f => f.id);
       await farmUserRepo.delete({ farmId: In(farmIds) });
     }
     
     await farmRepo.delete({ name: In(['Green Valley Farm', 'Blue Ridge Farm']) });
     await userRepo.delete({ email: In(['farm1-owner@test.com', 'farm2-owner@test.com']) });

    // Create test users
    console.log('\n🔄 Creating test users...');
    
    const user1 = userRepo.create({
      email: 'farm1-owner@test.com',
      firstName: 'Farm1',
      lastName: 'Owner',
      password: await bcrypt.hash('password123', 12),
      roleId: testRole.id,
      status: UserStatus.ACTIVE
    });
    
    const user2 = userRepo.create({
      email: 'farm2-owner@test.com',
      firstName: 'Farm2',
      lastName: 'Owner',
      password: await bcrypt.hash('password123', 12),
      roleId: testRole.id,
      status: UserStatus.ACTIVE
    });
    
    await userRepo.save([user1, user2]);
    console.log('✅ Test users created');

    // Create test farms
    console.log('\n🔄 Creating test farms...');
    
    const farm1 = farmRepo.create({
      name: 'Green Valley Farm',
      description: 'Test farm 1 for data isolation',
      ownerId: user1.id,
      isActive: true
    });
    
    const farm2 = farmRepo.create({
      name: 'Blue Ridge Farm',
      description: 'Test farm 2 for data isolation',
      ownerId: user2.id,
      isActive: true
    });
    
    await farmRepo.save([farm1, farm2]);
    console.log('✅ Test farms created');

    // Create farm-user relationships
    console.log('\n🔄 Creating farm-user relationships...');
    
    const farmUser1 = farmUserRepo.create({
      farmId: farm1.id,
      userId: user1.id,
      role: FarmRole.OWNER,
      isActive: true
    });
    
    const farmUser2 = farmUserRepo.create({
      farmId: farm2.id,
      userId: user2.id,
      role: FarmRole.OWNER,
      isActive: true
    });
    
    await farmUserRepo.save([farmUser1, farmUser2]);
    console.log('✅ Farm-user relationships created');

    // Create test locations for each farm
    console.log('\n🔄 Creating test locations...');
    
    const location1 = locationRepo.create({
      name: 'Farm 1 Main Location',
      description: 'Main location for Farm 1',
      farmId: farm1.id
    });
    
    const location2 = locationRepo.create({
      name: 'Farm 2 Main Location',
      description: 'Main location for Farm 2',
      farmId: farm2.id
    });
    
    await locationRepo.save([location1, location2]);
    console.log('✅ Test locations created');

    // Create test assets for each farm
    console.log('\n🔄 Creating test assets...');
    
    const asset1 = assetRepo.create({
      assetCode: 'TRACTOR-001',
      name: 'John Deere Tractor',
      type: AssetType.MACHINERY,
      farmId: farm1.id,
      locationId: location1.id,
      assignedUserId: user1.id
    });
    
    const asset2 = assetRepo.create({
      assetCode: 'TRACTOR-002',
      name: 'Case IH Tractor',
      type: AssetType.MACHINERY,
      farmId: farm2.id,
      locationId: location2.id,
      assignedUserId: user2.id
    });
    
    await assetRepo.save([asset1, asset2]);
    console.log('✅ Test assets created');

    // Test data isolation - Query assets for farm1 only
    console.log('\n🔍 Testing data isolation...');
    
    const farm1Assets = await assetRepo.find({
      where: { farmId: farm1.id },
      relations: ['location']
    });
    
    const farm2Assets = await assetRepo.find({
      where: { farmId: farm2.id },
      relations: ['location']
    });
    
    console.log(`\n📊 Farm 1 (${farm1.name}) assets:`);
    farm1Assets.forEach(asset => {
      console.log(`  - ${asset.name} (${asset.assetCode}) at ${asset.location?.name}`);
    });
    
    console.log(`\n📊 Farm 2 (${farm2.name}) assets:`);
    farm2Assets.forEach(asset => {
      console.log(`  - ${asset.name} (${asset.assetCode}) at ${asset.location?.name}`);
    });

    // Verify isolation
    const farm1HasOnlyOwnAssets = farm1Assets.every(asset => asset.farmId === farm1.id);
    const farm2HasOnlyOwnAssets = farm2Assets.every(asset => asset.farmId === farm2.id);
    const noAssetOverlap = !farm1Assets.some(a1 => farm2Assets.some(a2 => a1.id === a2.id));
    
    console.log('\n🧪 Data Isolation Test Results:');
    console.log(`  ✅ Farm 1 has only its own assets: ${farm1HasOnlyOwnAssets}`);
    console.log(`  ✅ Farm 2 has only its own assets: ${farm2HasOnlyOwnAssets}`);
    console.log(`  ✅ No asset overlap between farms: ${noAssetOverlap}`);
    
    if (farm1HasOnlyOwnAssets && farm2HasOnlyOwnAssets && noAssetOverlap) {
      console.log('\n🎉 DATA ISOLATION TEST PASSED! Multi-tenant schema is working correctly.');
    } else {
      console.log('\n❌ DATA ISOLATION TEST FAILED! There are issues with the multi-tenant schema.');
    }

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await assetRepo.remove([asset1, asset2]);
    await locationRepo.remove([location1, location2]);
    await farmUserRepo.remove([farmUser1, farmUser2]);
    await farmRepo.remove([farm1, farm2]);
    await userRepo.remove([user1, user2]);
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Error during data isolation test:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testDataIsolation().catch(console.error);