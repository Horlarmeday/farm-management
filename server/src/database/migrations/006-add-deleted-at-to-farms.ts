import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtToFarms1703123456791 implements MigrationInterface {
  name = 'AddDeletedAtToFarms1703123456791';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add deletedAt column to farms table
    await queryRunner.query(`
      ALTER TABLE farms ADD COLUMN deletedAt TIMESTAMP NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove deletedAt column from farms table
    await queryRunner.query(`
      ALTER TABLE farms DROP COLUMN deletedAt
    `);
  }
}