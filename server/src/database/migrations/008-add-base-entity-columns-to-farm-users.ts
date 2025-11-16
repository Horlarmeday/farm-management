import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBaseEntityColumnsToFarmUsers1703123456793 implements MigrationInterface {
  name = 'AddBaseEntityColumnsToFarmUsers1703123456793';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing BaseEntity columns to farm_users table
    await queryRunner.query(`
      ALTER TABLE farm_users 
      ADD COLUMN deletedAt TIMESTAMP NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the added column
    await queryRunner.query(`
      ALTER TABLE farm_users 
      DROP COLUMN deletedAt
    `);
  }
}