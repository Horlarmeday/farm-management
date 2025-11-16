import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingFarmUserColumns1703123456794 implements MigrationInterface {
  name = 'AddMissingFarmUserColumns1703123456794';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing columns to farm_users table
    await queryRunner.query(`
      ALTER TABLE farm_users 
      ADD COLUMN invitedBy VARCHAR(255) NULL,
      ADD COLUMN notes TEXT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the added columns
    await queryRunner.query(`
      ALTER TABLE farm_users 
      DROP COLUMN invitedBy,
      DROP COLUMN notes
    `);
  }
}