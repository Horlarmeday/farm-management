import { DataSource } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { seedRolesAndPermissions } from './001-roles-permissions.seed';

export const runSeeds = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');

    // Initialize database connection if not already connected
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Run seeds in order
    await seedRolesAndPermissions(AppDataSource);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  }
};

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds()
    .then(() => {
      console.log('✅ Seeds completed, exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
