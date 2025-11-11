import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFieldEncryption1703000000000 implements MigrationInterface {
  name = 'AddFieldEncryption1703000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if financial_transactions table exists
    const tableExists = await queryRunner.hasTable('financial_transactions');
    if (!tableExists) {
      console.log('Financial transactions table does not exist, skipping migration');
      return;
    }

    // Check if encrypted columns already exist (they might be created by synchronize=true)
    const hasEncryptedAmount = await queryRunner.hasColumn('financial_transactions', '_encryptedAmount');
    const hasEncryptedReference = await queryRunner.hasColumn('financial_transactions', '_encryptedReferenceNumber');
    
    if (hasEncryptedAmount && hasEncryptedReference) {
      console.log('Encrypted columns already exist, skipping migration');
      return;
    }

    // Add new encrypted columns to financial_transactions only if they don't exist
    if (!hasEncryptedAmount) {
      await queryRunner.addColumn(
        'financial_transactions',
        new TableColumn({
          name: '_encryptedAmount',
          type: 'text',
          isNullable: false,
          default: "''",
        })
      );
      console.log('Added _encryptedAmount column');
    }

    if (!hasEncryptedReference) {
      await queryRunner.addColumn(
        'financial_transactions',
        new TableColumn({
          name: '_encryptedReferenceNumber',
          type: 'text',
          isNullable: true,
        })
      );
      console.log('Added _encryptedReferenceNumber column');
    }

    // Only migrate data if we have old columns to migrate from
    const hasOldAmount = await queryRunner.hasColumn('financial_transactions', 'amount');
    const hasOldReference = await queryRunner.hasColumn('financial_transactions', 'referenceNumber');
    
    if (hasOldAmount && !hasEncryptedAmount) {
      // Migrate existing data (amounts will be stored as plain text temporarily)
      // In production, you would encrypt existing data here
      await queryRunner.query(`
        UPDATE financial_transactions 
        SET _encryptedAmount = CAST(amount AS TEXT)
        WHERE amount IS NOT NULL
      `);
      console.log('Migrated amount data to _encryptedAmount');
      
      // Drop old amount column after data migration
      await queryRunner.dropColumn('financial_transactions', 'amount');
      console.log('Dropped old amount column');
    }
    
    if (hasOldReference && !hasEncryptedReference) {
      await queryRunner.query(`
        UPDATE financial_transactions 
        SET _encryptedReferenceNumber = referenceNumber
        WHERE referenceNumber IS NOT NULL
      `);
      console.log('Migrated referenceNumber data to _encryptedReferenceNumber');
      
      // Drop old referenceNumber column after data migration
      await queryRunner.dropColumn('financial_transactions', 'referenceNumber');
      console.log('Dropped old referenceNumber column');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if financial_transactions table exists
    const tableExists = await queryRunner.hasTable('financial_transactions');
    if (!tableExists) {
      console.log('Financial transactions table does not exist, skipping rollback');
      return;
    }

    // Check which columns exist
    const hasEncryptedAmount = await queryRunner.hasColumn('financial_transactions', '_encryptedAmount');
    const hasEncryptedReference = await queryRunner.hasColumn('financial_transactions', '_encryptedReferenceNumber');
    const hasAmount = await queryRunner.hasColumn('financial_transactions', 'amount');
    const hasReference = await queryRunner.hasColumn('financial_transactions', 'referenceNumber');

    // Restore original columns if they don't exist
    if (!hasAmount) {
      await queryRunner.addColumn(
        'financial_transactions',
        new TableColumn({
          name: 'amount',
          type: 'decimal',
          precision: 15,
          scale: 2,
          isNullable: false,
        })
      );
      console.log('Restored amount column');
    }

    if (!hasReference) {
      await queryRunner.addColumn(
        'financial_transactions',
        new TableColumn({
          name: 'referenceNumber',
          type: 'varchar',
          length: '255',
          isNullable: true,
        })
      );
      console.log('Restored referenceNumber column');
    }

    // Migrate data back (decrypt if needed) only if encrypted columns exist
    if (hasEncryptedAmount && !hasAmount) {
      await queryRunner.query(`
        UPDATE financial_transactions 
        SET amount = CAST(_encryptedAmount AS DECIMAL(15,2))
        WHERE _encryptedAmount IS NOT NULL AND _encryptedAmount != ''
      `);
      console.log('Migrated data back from _encryptedAmount to amount');
    }

    if (hasEncryptedReference && !hasReference) {
      await queryRunner.query(`
        UPDATE financial_transactions 
        SET referenceNumber = _encryptedReferenceNumber
        WHERE _encryptedReferenceNumber IS NOT NULL
      `);
      console.log('Migrated data back from _encryptedReferenceNumber to referenceNumber');
    }

    // Drop encrypted columns only if they exist
    if (hasEncryptedAmount) {
      await queryRunner.dropColumn('financial_transactions', '_encryptedAmount');
      console.log('Dropped _encryptedAmount column');
    }
    
    if (hasEncryptedReference) {
      await queryRunner.dropColumn('financial_transactions', '_encryptedReferenceNumber');
      console.log('Dropped _encryptedReferenceNumber column');
    }
  }
}