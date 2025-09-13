const { AppDataSource } = require('./dist/data-source');
const { FinancialCategory } = require('./dist/entities/FinancialCategory');

async function checkCategories() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    const categoryRepo = AppDataSource.getRepository(FinancialCategory);
    
    // Check existing categories
    const categories = await categoryRepo.find();
    console.log('📊 Existing categories:', categories.length);
    
    if (categories.length === 0) {
      console.log('🔧 Creating default category...');
      
      // Create a default category
      const defaultCategory = categoryRepo.create({
        name: 'Feed & Supplies',
        type: 'EXPENSE',
        description: 'Animal feed and farm supplies',
        farm_id: null // Default category for all farms
      });
      
      const savedCategory = await categoryRepo.save(defaultCategory);
      console.log('✅ Created default category:', savedCategory);
    } else {
      console.log('📋 Categories found:');
      categories.forEach(cat => {
        console.log(`  - ID: ${cat.id}, Name: ${cat.name}, Type: ${cat.type}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await AppDataSource.destroy();
  }
}

checkCategories();