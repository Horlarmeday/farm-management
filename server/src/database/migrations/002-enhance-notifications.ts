import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceNotifications1703123456789 implements MigrationInterface {
  name = 'EnhanceNotifications1703123456789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if columns already exist before adding them
    const tableExists = await queryRunner.hasTable('notifications');
    if (!tableExists) {
      console.log('Notifications table does not exist, skipping migration');
      return;
    }

    // Check if priority column exists
    const hasPriority = await queryRunner.hasColumn('notifications', 'priority');
    if (!hasPriority) {
      await queryRunner.query(`ALTER TABLE notifications ADD COLUMN priority VARCHAR(20) DEFAULT 'medium' NOT NULL`);
    }

    // Check if delivery_methods column exists
    const hasDeliveryMethods = await queryRunner.hasColumn('notifications', 'delivery_methods');
    if (!hasDeliveryMethods) {
      await queryRunner.query(`ALTER TABLE notifications ADD COLUMN delivery_methods JSON NOT NULL`);
    }

    // Check if email_sent column exists
    const hasEmailSent = await queryRunner.hasColumn('notifications', 'email_sent');
    if (!hasEmailSent) {
      await queryRunner.query(`ALTER TABLE notifications ADD COLUMN email_sent BOOLEAN DEFAULT FALSE`);
    }

    // Check if sms_sent column exists
    const hasSmsSent = await queryRunner.hasColumn('notifications', 'sms_sent');
    if (!hasSmsSent) {
      await queryRunner.query(`ALTER TABLE notifications ADD COLUMN sms_sent BOOLEAN DEFAULT FALSE`);
    }

    // Check if push_sent column exists
    const hasPushSent = await queryRunner.hasColumn('notifications', 'push_sent');
    if (!hasPushSent) {
      await queryRunner.query(`ALTER TABLE notifications ADD COLUMN push_sent BOOLEAN DEFAULT FALSE`);
    }

    // Check if in_app_sent column exists
    const hasInAppSent = await queryRunner.hasColumn('notifications', 'in_app_sent');
    if (!hasInAppSent) {
      await queryRunner.query(`ALTER TABLE notifications ADD COLUMN in_app_sent BOOLEAN DEFAULT FALSE`);
    }

    // Check if action_required column exists
    const hasActionRequired = await queryRunner.hasColumn('notifications', 'action_required');
    if (!hasActionRequired) {
      await queryRunner.query(`ALTER TABLE notifications ADD COLUMN action_required BOOLEAN DEFAULT FALSE`);
    }

    // Check if expires_at column exists
    const hasExpiresAt = await queryRunner.hasColumn('notifications', 'expires_at');
    if (!hasExpiresAt) {
      await queryRunner.query(`ALTER TABLE notifications ADD COLUMN expires_at TIMESTAMP NULL`);
    }

    // Check if delivered_at column exists
    const hasDeliveredAt = await queryRunner.hasColumn('notifications', 'delivered_at');
    if (!hasDeliveredAt) {
      await queryRunner.query(`ALTER TABLE notifications ADD COLUMN delivered_at TIMESTAMP NULL`);
    }

    // Check if clicked_at column exists
    const hasClickedAt = await queryRunner.hasColumn('notifications', 'clicked_at');
    if (!hasClickedAt) {
      await queryRunner.query(`ALTER TABLE notifications ADD COLUMN clicked_at TIMESTAMP NULL`);
    }

    // Check if reference_url column exists
    const hasReferenceUrl = await queryRunner.hasColumn('notifications', 'reference_url');
    if (!hasReferenceUrl) {
      await queryRunner.query(`ALTER TABLE notifications ADD COLUMN reference_url VARCHAR(255) NULL`);
    }

    // Update existing notifications to have default delivery methods
    await queryRunner.query(`
      UPDATE notifications 
      SET delivery_methods = '["in_app"]',
          in_app_sent = TRUE
      WHERE delivery_methods IS NULL
    `);

    // Add indexes for better performance
    await queryRunner.query(`CREATE INDEX idx_notifications_priority ON notifications(priority)`);
    await queryRunner.query(`CREATE INDEX idx_notifications_action_required ON notifications(action_required)`);
    await queryRunner.query(`CREATE INDEX idx_notifications_expires_at ON notifications(expires_at)`);
    
    // Note: JSON indexes are not supported in this MySQL version, skipping delivery_methods index
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes
    await queryRunner.query(`DROP INDEX idx_notifications_priority`);
    await queryRunner.query(`DROP INDEX idx_notifications_delivery_methods`);
    await queryRunner.query(`DROP INDEX idx_notifications_action_required`);
    await queryRunner.query(`DROP INDEX idx_notifications_expires_at`);

    // Remove columns
    await queryRunner.query(`
      ALTER TABLE notifications 
      DROP COLUMN priority,
      DROP COLUMN delivery_methods,
      DROP COLUMN email_sent,
      DROP COLUMN sms_sent,
      DROP COLUMN push_sent,
      DROP COLUMN in_app_sent,
      DROP COLUMN action_required,
      DROP COLUMN expires_at,
      DROP COLUMN delivered_at,
      DROP COLUMN clicked_at,
      DROP COLUMN reference_url
    `);
  }
}