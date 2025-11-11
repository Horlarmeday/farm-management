import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserFieldEncryption1703000001000 implements MigrationInterface {
  name = 'AddUserFieldEncryption1703000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if users table exists
    const tableExists = await queryRunner.hasTable('users');
    if (!tableExists) {
      console.log('Users table does not exist, skipping migration');
      return;
    }

    // Check which columns already exist
    const hasEncryptedPhone = await queryRunner.hasColumn('users', '_encryptedPhone');
    const hasEncryptedAddress = await queryRunner.hasColumn('users', '_encryptedAddress');
    const hasEncryptedEmergencyContact = await queryRunner.hasColumn('users', '_encryptedEmergencyContact');
    const hasPhone = await queryRunner.hasColumn('users', 'phone');
    const hasAddress = await queryRunner.hasColumn('users', 'address');
    const hasEmergencyContact = await queryRunner.hasColumn('users', 'emergencyContact');

    // Add new encrypted columns to users table only if they don't exist
    if (!hasEncryptedPhone) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: '_encryptedPhone',
          type: 'text',
          isNullable: true,
        })
      );
      console.log('Added _encryptedPhone column');
    }

    if (!hasEncryptedAddress) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: '_encryptedAddress',
          type: 'text',
          isNullable: true,
        })
      );
      console.log('Added _encryptedAddress column');
    }

    if (!hasEncryptedEmergencyContact) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: '_encryptedEmergencyContact',
          type: 'text',
          isNullable: true,
        })
      );
      console.log('Added _encryptedEmergencyContact column');
    }

    // Migrate existing data only if old columns exist
    if (hasPhone) {
      await queryRunner.query(`
        UPDATE users 
        SET _encryptedPhone = phone
        WHERE phone IS NOT NULL
      `);
      console.log('Migrated data from phone to _encryptedPhone');
    }

    if (hasAddress) {
      await queryRunner.query(`
        UPDATE users 
        SET _encryptedAddress = address
        WHERE address IS NOT NULL
      `);
      console.log('Migrated data from address to _encryptedAddress');
    }

    if (hasEmergencyContact) {
      await queryRunner.query(`
        UPDATE users 
        SET _encryptedEmergencyContact = emergencyContact
        WHERE emergencyContact IS NOT NULL
      `);
      console.log('Migrated data from emergencyContact to _encryptedEmergencyContact');
    }

    // Drop old columns after data migration only if they exist
    if (hasPhone) {
      await queryRunner.dropColumn('users', 'phone');
      console.log('Dropped phone column');
    }
    
    if (hasAddress) {
      await queryRunner.dropColumn('users', 'address');
      console.log('Dropped address column');
    }
    
    if (hasEmergencyContact) {
      await queryRunner.dropColumn('users', 'emergencyContact');
      console.log('Dropped emergencyContact column');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if users table exists
    const tableExists = await queryRunner.hasTable('users');
    if (!tableExists) {
      console.log('Users table does not exist, skipping rollback');
      return;
    }

    // Check which columns exist
    const hasEncryptedPhone = await queryRunner.hasColumn('users', '_encryptedPhone');
    const hasEncryptedAddress = await queryRunner.hasColumn('users', '_encryptedAddress');
    const hasEncryptedEmergencyContact = await queryRunner.hasColumn('users', '_encryptedEmergencyContact');
    const hasPhone = await queryRunner.hasColumn('users', 'phone');
    const hasAddress = await queryRunner.hasColumn('users', 'address');
    const hasEmergencyContact = await queryRunner.hasColumn('users', 'emergencyContact');

    // Restore original columns if they don't exist
    if (!hasPhone) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'phone',
          type: 'varchar',
          length: '20',
          isNullable: true,
        })
      );
      console.log('Restored phone column');
    }

    if (!hasAddress) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'address',
          type: 'text',
          isNullable: true,
        })
      );
      console.log('Restored address column');
    }

    if (!hasEmergencyContact) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'emergencyContact',
          type: 'text',
          isNullable: true,
        })
      );
      console.log('Restored emergencyContact column');
    }

    // Migrate data back (decrypt if needed) only if encrypted columns exist
    if (hasEncryptedPhone && !hasPhone) {
      await queryRunner.query(`
        UPDATE users 
        SET phone = _encryptedPhone
        WHERE _encryptedPhone IS NOT NULL
      `);
      console.log('Migrated data back from _encryptedPhone to phone');
    }

    if (hasEncryptedAddress && !hasAddress) {
      await queryRunner.query(`
        UPDATE users 
        SET address = _encryptedAddress
        WHERE _encryptedAddress IS NOT NULL
      `);
      console.log('Migrated data back from _encryptedAddress to address');
    }

    if (hasEncryptedEmergencyContact && !hasEmergencyContact) {
      await queryRunner.query(`
        UPDATE users 
        SET emergencyContact = _encryptedEmergencyContact
        WHERE _encryptedEmergencyContact IS NOT NULL
      `);
      console.log('Migrated data back from _encryptedEmergencyContact to emergencyContact');
    }

    // Drop encrypted columns only if they exist
    if (hasEncryptedPhone) {
      await queryRunner.dropColumn('users', '_encryptedPhone');
      console.log('Dropped _encryptedPhone column');
    }
    
    if (hasEncryptedAddress) {
      await queryRunner.dropColumn('users', '_encryptedAddress');
      console.log('Dropped _encryptedAddress column');
    }
    
    if (hasEncryptedEmergencyContact) {
      await queryRunner.dropColumn('users', '_encryptedEmergencyContact');
      console.log('Dropped _encryptedEmergencyContact column');
    }
  }
}