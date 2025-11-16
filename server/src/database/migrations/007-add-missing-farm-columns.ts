import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingFarmColumns1703123456792 implements MigrationInterface {
  name = 'AddMissingFarmColumns1703123456792';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing columns to farms table
    await queryRunner.query(`
      ALTER TABLE farms 
      ADD COLUMN city VARCHAR(100) NULL,
      ADD COLUMN state VARCHAR(100) NULL,
      ADD COLUMN country VARCHAR(100) NULL,
      ADD COLUMN postalCode VARCHAR(20) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the added columns
    await queryRunner.query(`
      ALTER TABLE farms 
      DROP COLUMN city,
      DROP COLUMN state,
      DROP COLUMN country,
      DROP COLUMN postalCode
    `);
  }
}