-- Create iot_sensors table for sensor device management
CREATE TABLE IF NOT EXISTS iot_sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'temperature', 'humidity', 'soil_moisture', 'ph', 'light', 
        'wind_speed', 'rainfall', 'pressure', 'co2', 'nitrogen',
        'phosphorus', 'potassium', 'conductivity', 'dissolved_oxygen'
    )),
    location JSONB, -- {"latitude": 0, "longitude": 0, "zone": "field_1", "description": "North field corner"}
    device_id VARCHAR(255) UNIQUE NOT NULL, -- Physical device identifier
    model VARCHAR(255),
    manufacturer VARCHAR(255),
    firmware_version VARCHAR(50),
    battery_level DECIMAL(5,2), -- Percentage 0-100
    signal_strength INTEGER, -- RSSI or similar
    calibration_data JSONB DEFAULT '{}', -- Sensor-specific calibration parameters
    thresholds JSONB DEFAULT '{}', -- Alert thresholds {"min": 0, "max": 100, "optimal_min": 20, "optimal_max": 80}
    sampling_interval INTEGER DEFAULT 300, -- Seconds between readings
    is_active BOOLEAN DEFAULT true,
    last_reading_at TIMESTAMP WITH TIME ZONE,
    last_maintenance TIMESTAMP WITH TIME ZONE,
    next_maintenance TIMESTAMP WITH TIME ZONE,
    installation_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for iot_sensors
CREATE INDEX IF NOT EXISTS idx_iot_sensors_farm_id ON iot_sensors(farm_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_type ON iot_sensors(type);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_device_id ON iot_sensors(device_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_active ON iot_sensors(is_active);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_last_reading ON iot_sensors(last_reading_at);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_location ON iot_sensors USING GIN(location);

-- Create sensor_readings table for time-series data
CREATE TABLE IF NOT EXISTS sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID NOT NULL REFERENCES iot_sensors(id) ON DELETE CASCADE,
    value DECIMAL(10,4) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- celsius, fahrenheit, percent, ph, lux, etc.
    quality_score DECIMAL(3,2) DEFAULT 1.0, -- 0.0-1.0 data quality indicator
    metadata JSONB DEFAULT '{}', -- Additional sensor-specific data
    raw_data JSONB, -- Original sensor payload for debugging
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for sensor_readings (optimized for time-series queries)
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_timestamp ON sensor_readings(sensor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_created_at ON sensor_readings(created_at);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_quality ON sensor_readings(quality_score);

-- Create composite index for efficient range queries
CREATE INDEX IF NOT EXISTS idx_sensor_readings_composite 
ON sensor_readings(sensor_id, timestamp DESC, value);

-- Create sensor_calibrations table for calibration history
CREATE TABLE IF NOT EXISTS sensor_calibrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID NOT NULL REFERENCES iot_sensors(id) ON DELETE CASCADE,
    calibration_type VARCHAR(50) NOT NULL, -- 'factory', 'field', 'maintenance'
    reference_value DECIMAL(10,4),
    measured_value DECIMAL(10,4),
    adjustment_factor DECIMAL(10,6),
    calibration_data JSONB DEFAULT '{}',
    performed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for sensor_calibrations
CREATE INDEX IF NOT EXISTS idx_sensor_calibrations_sensor_id ON sensor_calibrations(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_calibrations_type ON sensor_calibrations(calibration_type);
CREATE INDEX IF NOT EXISTS idx_sensor_calibrations_created_at ON sensor_calibrations(created_at);

-- Create sensor_maintenance table for maintenance tracking
CREATE TABLE IF NOT EXISTS sensor_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID NOT NULL REFERENCES iot_sensors(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL, -- 'routine', 'repair', 'replacement', 'calibration'
    description TEXT NOT NULL,
    performed_by UUID REFERENCES users(id),
    cost DECIMAL(10,2),
    parts_replaced TEXT[],
    before_status JSONB,
    after_status JSONB,
    next_maintenance_due DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for sensor_maintenance
CREATE INDEX IF NOT EXISTS idx_sensor_maintenance_sensor_id ON sensor_maintenance(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_maintenance_type ON sensor_maintenance(maintenance_type);
CREATE INDEX IF NOT EXISTS idx_sensor_maintenance_performed_by ON sensor_maintenance(performed_by);
CREATE INDEX IF NOT EXISTS idx_sensor_maintenance_created_at ON sensor_maintenance(created_at);
CREATE INDEX IF NOT EXISTS idx_sensor_maintenance_next_due ON sensor_maintenance(next_maintenance_due);

-- Create data_aggregations table for pre-computed statistics
CREATE TABLE IF NOT EXISTS data_aggregations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID NOT NULL REFERENCES iot_sensors(id) ON DELETE CASCADE,
    aggregation_type VARCHAR(20) NOT NULL CHECK (aggregation_type IN ('hourly', 'daily', 'weekly', 'monthly')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    min_value DECIMAL(10,4),
    max_value DECIMAL(10,4),
    avg_value DECIMAL(10,4),
    median_value DECIMAL(10,4),
    std_dev DECIMAL(10,4),
    sample_count INTEGER,
    quality_avg DECIMAL(3,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for data_aggregations
CREATE INDEX IF NOT EXISTS idx_data_aggregations_sensor_id ON data_aggregations(sensor_id);
CREATE INDEX IF NOT EXISTS idx_data_aggregations_type ON data_aggregations(aggregation_type);
CREATE INDEX IF NOT EXISTS idx_data_aggregations_period ON data_aggregations(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_data_aggregations_sensor_period 
ON data_aggregations(sensor_id, aggregation_type, period_start DESC);

-- Create unique constraint to prevent duplicate aggregations
CREATE UNIQUE INDEX IF NOT EXISTS idx_data_aggregations_unique 
ON data_aggregations(sensor_id, aggregation_type, period_start);

-- Create triggers for updated_at columns
CREATE TRIGGER update_iot_sensors_updated_at 
    BEFORE UPDATE ON iot_sensors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update sensor last_reading_at
CREATE OR REPLACE FUNCTION update_sensor_last_reading()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE iot_sensors 
    SET last_reading_at = NEW.timestamp 
    WHERE id = NEW.sensor_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update last_reading_at when new reading is inserted
CREATE TRIGGER update_sensor_last_reading_trigger
    AFTER INSERT ON sensor_readings
    FOR EACH ROW EXECUTE FUNCTION update_sensor_last_reading();

-- Create function for automatic data aggregation
CREATE OR REPLACE FUNCTION create_hourly_aggregation(sensor_uuid UUID, start_time TIMESTAMP WITH TIME ZONE)
RETURNS VOID AS $$
DECLARE
    end_time TIMESTAMP WITH TIME ZONE;
BEGIN
    end_time := start_time + INTERVAL '1 hour';
    
    INSERT INTO data_aggregations (
        sensor_id, aggregation_type, period_start, period_end,
        min_value, max_value, avg_value, median_value, std_dev, sample_count, quality_avg
    )
    SELECT 
        sensor_uuid,
        'hourly',
        start_time,
        end_time,
        MIN(value),
        MAX(value),
        AVG(value),
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value),
        STDDEV(value),
        COUNT(*),
        AVG(quality_score)
    FROM sensor_readings 
    WHERE sensor_id = sensor_uuid 
        AND timestamp >= start_time 
        AND timestamp < end_time
        AND quality_score >= 0.5
    HAVING COUNT(*) > 0
    ON CONFLICT (sensor_id, aggregation_type, period_start) DO UPDATE SET
        period_end = EXCLUDED.period_end,
        min_value = EXCLUDED.min_value,
        max_value = EXCLUDED.max_value,
        avg_value = EXCLUDED.avg_value,
        median_value = EXCLUDED.median_value,
        std_dev = EXCLUDED.std_dev,
        sample_count = EXCLUDED.sample_count,
        quality_avg = EXCLUDED.quality_avg;
END;
$$ language 'plpgsql';

-- Create view for latest sensor readings
CREATE OR REPLACE VIEW latest_sensor_readings AS
SELECT DISTINCT ON (s.id)
    s.id as sensor_id,
    s.name as sensor_name,
    s.type as sensor_type,
    s.farm_id,
    s.location,
    s.thresholds,
    s.is_active,
    sr.value,
    sr.unit,
    sr.quality_score,
    sr.timestamp as reading_timestamp,
    CASE 
        WHEN sr.timestamp < NOW() - INTERVAL '1 hour' THEN 'stale'
        WHEN sr.quality_score < 0.7 THEN 'poor_quality'
        WHEN s.thresholds->>'min' IS NOT NULL AND sr.value < (s.thresholds->>'min')::decimal THEN 'below_threshold'
        WHEN s.thresholds->>'max' IS NOT NULL AND sr.value > (s.thresholds->>'max')::decimal THEN 'above_threshold'
        ELSE 'normal'
    END as status
FROM iot_sensors s
LEFT JOIN sensor_readings sr ON s.id = sr.sensor_id
WHERE s.is_active = true
ORDER BY s.id, sr.timestamp DESC;

-- Create view for sensor health monitoring
CREATE OR REPLACE VIEW sensor_health_status AS
SELECT 
    s.id,
    s.name,
    s.type,
    s.farm_id,
    s.device_id,
    s.battery_level,
    s.signal_strength,
    s.last_reading_at,
    s.last_maintenance,
    s.next_maintenance,
    CASE 
        WHEN s.last_reading_at IS NULL THEN 'never_connected'
        WHEN s.last_reading_at < NOW() - INTERVAL '2 hours' THEN 'offline'
        WHEN s.last_reading_at < NOW() - INTERVAL '30 minutes' THEN 'delayed'
        WHEN s.battery_level IS NOT NULL AND s.battery_level < 20 THEN 'low_battery'
        WHEN s.signal_strength IS NOT NULL AND s.signal_strength < -80 THEN 'poor_signal'
        WHEN s.next_maintenance IS NOT NULL AND s.next_maintenance < CURRENT_DATE THEN 'maintenance_due'
        ELSE 'healthy'
    END as health_status,
    EXTRACT(EPOCH FROM (NOW() - s.last_reading_at))/60 as minutes_since_last_reading
FROM iot_sensors s
WHERE s.is_active = true;

-- Insert sample sensor types and default thresholds
INSERT INTO iot_sensors (farm_id, name, type, device_id, location, thresholds, sampling_interval)
SELECT 
    f.id,
    sensor_data.name,
    sensor_data.type,
    sensor_data.device_id,
    sensor_data.location::jsonb,
    sensor_data.thresholds::jsonb,
    sensor_data.interval
FROM farms f
CROSS JOIN (
    VALUES 
        ('Temperature Sensor 1', 'temperature', 'TEMP_001', '{"zone": "greenhouse_1", "description": "Main greenhouse temperature"}', '{"min": 15, "max": 35, "optimal_min": 20, "optimal_max": 28}', 300),
        ('Humidity Sensor 1', 'humidity', 'HUM_001', '{"zone": "greenhouse_1", "description": "Main greenhouse humidity"}', '{"min": 40, "max": 80, "optimal_min": 50, "optimal_max": 70}', 300),
        ('Soil Moisture 1', 'soil_moisture', 'SM_001', '{"zone": "field_1", "description": "North field soil moisture"}', '{"min": 20, "max": 80, "optimal_min": 30, "optimal_max": 60}', 600),
        ('pH Sensor 1', 'ph', 'PH_001', '{"zone": "field_1", "description": "Soil pH monitoring"}', '{"min": 5.5, "max": 8.0, "optimal_min": 6.0, "optimal_max": 7.5}', 1800)
) AS sensor_data(name, type, device_id, location, thresholds, interval)
WHERE NOT EXISTS (
    SELECT 1 FROM iot_sensors 
    WHERE farm_id = f.id AND device_id = sensor_data.device_id
);