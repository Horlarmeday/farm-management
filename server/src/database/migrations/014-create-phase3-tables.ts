import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePhase3Tables1757758900000 implements MigrationInterface {
  name = 'CreatePhase3Tables1757758900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create push_subscriptions table
    await queryRunner.query(`
      CREATE TABLE push_subscriptions (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        subscription JSON NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(active)
    `);

    // Create notification_preferences table
    await queryRunner.query(`
      CREATE TABLE notification_preferences (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        type ENUM('alert', 'info', 'warning', 'critical') NOT NULL,
        enabled BOOLEAN DEFAULT TRUE,
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_type (user_id, type)
      )
    `);

    // Create iot_sensors table
    await queryRunner.query(`
      CREATE TABLE iot_sensors (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        farm_id VARCHAR(36) NOT NULL,
        type ENUM('temperature', 'humidity', 'soil_moisture', 'ph', 'light') NOT NULL,
        location VARCHAR(255),
        configuration JSON,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_iot_sensors_farm_id ON iot_sensors(farm_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_iot_sensors_type ON iot_sensors(type)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_iot_sensors_active ON iot_sensors(active)
    `);

    // Create sensor_readings table
    await queryRunner.query(`
      CREATE TABLE sensor_readings (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        sensor_id VARCHAR(36) NOT NULL,
        value DECIMAL(10,4) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        reading_time TIMESTAMP NOT NULL,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sensor_id) REFERENCES iot_sensors(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_sensor_readings_sensor_id ON sensor_readings(sensor_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_sensor_readings_time ON sensor_readings(reading_time DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_sensor_readings_sensor_time ON sensor_readings(sensor_id, reading_time DESC)
    `);

    // Create predictions table
    await queryRunner.query(`
      CREATE TABLE predictions (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        farm_id VARCHAR(36) NOT NULL,
        type ENUM('yield', 'disease', 'weather', 'market') NOT NULL,
        value DECIMAL(12,4) NOT NULL,
        confidence DECIMAL(5,4) NOT NULL,
        factors JSON,
        model_version VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_until TIMESTAMP,
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_predictions_farm_id ON predictions(farm_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_predictions_type ON predictions(type)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_predictions_created_at ON predictions(created_at DESC)
    `);

    // Create sync_queue table
    await queryRunner.query(`
      CREATE TABLE sync_queue (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        operation ENUM('create', 'update', 'delete') NOT NULL,
        endpoint VARCHAR(255) NOT NULL,
        payload JSON NOT NULL,
        retry_count INT DEFAULT 0,
        max_retries INT DEFAULT 3,
        status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_sync_queue_user_id ON sync_queue(user_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_sync_queue_status ON sync_queue(status)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_sync_queue_created_at ON sync_queue(created_at)
    `);

    // Create offline_data table
    await queryRunner.query(`
      CREATE TABLE offline_data (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        type ENUM('farm', 'livestock', 'transaction', 'inventory') NOT NULL,
        data JSON NOT NULL,
        synced BOOLEAN DEFAULT FALSE,
        conflicted BOOLEAN DEFAULT FALSE,
        conflict_data JSON NULL,
        modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        synced_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_offline_data_user_id ON offline_data(user_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_offline_data_synced ON offline_data(synced)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_offline_data_conflicted ON offline_data(conflicted)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_offline_data_type ON offline_data(type)
    `);

    // Insert default notification preferences for existing users
    await queryRunner.query(`
      INSERT INTO notification_preferences (user_id, type, enabled, priority)
      SELECT id, 'alert', TRUE, 'high' FROM users
      UNION ALL
      SELECT id, 'warning', TRUE, 'medium' FROM users
      UNION ALL
      SELECT id, 'info', TRUE, 'low' FROM users
      UNION ALL
      SELECT id, 'critical', TRUE, 'critical' FROM users
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS offline_data`);
    await queryRunner.query(`DROP TABLE IF EXISTS sync_queue`);
    await queryRunner.query(`DROP TABLE IF EXISTS predictions`);
    await queryRunner.query(`DROP TABLE IF EXISTS sensor_readings`);
    await queryRunner.query(`DROP TABLE IF EXISTS iot_sensors`);
    await queryRunner.query(`DROP TABLE IF EXISTS notification_preferences`);
    await queryRunner.query(`DROP TABLE IF EXISTS push_subscriptions`);
  }
}