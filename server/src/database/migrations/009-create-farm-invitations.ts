import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFarmInvitations1703123456794 implements MigrationInterface {
  name = 'CreateFarmInvitations1703123456794';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create farm_invitations table
    await queryRunner.query(`
      CREATE TABLE farm_invitations (
        id VARCHAR(255) PRIMARY KEY,
        inviteeEmail VARCHAR(255) NOT NULL,
        inviteeName VARCHAR(255),
        role ENUM('owner', 'manager', 'worker') NOT NULL,
        status ENUM('pending', 'accepted', 'declined', 'expired') NOT NULL DEFAULT 'pending',
        token VARCHAR(255) NOT NULL UNIQUE,
        expiresAt TIMESTAMP NOT NULL,
        acceptedAt TIMESTAMP NULL,
        message TEXT,
        farmId VARCHAR(255) NOT NULL,
        invitedById VARCHAR(255) NOT NULL,
        acceptedById VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deletedAt TIMESTAMP NULL,
        FOREIGN KEY (farmId) REFERENCES farms(id) ON DELETE CASCADE,
        FOREIGN KEY (invitedById) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (acceptedById) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_farm_email (farmId, inviteeEmail)
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX idx_farm_invitations_token ON farm_invitations(token)
    `);
    
    await queryRunner.query(`
      CREATE INDEX idx_farm_invitations_status ON farm_invitations(status)
    `);
    
    await queryRunner.query(`
      CREATE INDEX idx_farm_invitations_expires_at ON farm_invitations(expiresAt)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX idx_farm_invitations_expires_at ON farm_invitations`);
    await queryRunner.query(`DROP INDEX idx_farm_invitations_status ON farm_invitations`);
    await queryRunner.query(`DROP INDEX idx_farm_invitations_token ON farm_invitations`);
    
    // Drop table
    await queryRunner.query(`DROP TABLE farm_invitations`);
  }
}