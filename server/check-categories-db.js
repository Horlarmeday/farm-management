import { AppDataSource } from './src/config/database.js';
import { FinancialCategory } from './src/entities/FinancialCategory.js';

async function checkCategories() {
  try {
    console.log('Initializing database connection...');
    
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('Database connected. Checking categories...');
    
    // Get repository
    const categoryRepo = AppDataSource.getRepository(FinancialCategory);
    
    // Count all categories
    const count = await categoryRepo.count();
    console.log(`Total categories in database: ${count}`);
    
    // Get all categories
    const categories = await categoryRepo.find();
    console.log('Categories found:', categories.length);
    
    if (categories.length > 0) {
      console.log('Sample categories:');
      categories.slice(0, 5).forEach(c => {
        console.log(`- ${c.name} (${c.type}) - farm_id: ${c.farm_id || 'null'}`);
      });
    }
    
    await AppDataSource.destroy();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

checkCategories();