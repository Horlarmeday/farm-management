-- Create predictions table for ML model outputs
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) DEFAULT '1.0',
    prediction_type VARCHAR(50) NOT NULL CHECK (prediction_type IN (
        'yield_forecast', 'weather_forecast', 'disease_risk', 'pest_risk',
        'irrigation_schedule', 'harvest_timing', 'market_price', 'resource_optimization'
    )),
    input_data JSONB NOT NULL, -- Input features used for prediction
    output_data JSONB NOT NULL, -- Prediction results
    confidence_score DECIMAL(5,4), -- 0.0000-1.0000
    prediction_horizon INTEGER, -- Days into the future
    target_date DATE, -- When the prediction is for
    accuracy_score DECIMAL(5,4), -- Actual vs predicted accuracy (filled later)
    metadata JSONB DEFAULT '{}', -- Model-specific metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE -- When prediction becomes stale
);

-- Create indexes for predictions
CREATE INDEX IF NOT EXISTS idx_predictions_farm_id ON predictions(farm_id);
CREATE INDEX IF NOT EXISTS idx_predictions_model ON predictions(model_name, model_version);
CREATE INDEX IF NOT EXISTS idx_predictions_type ON predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_predictions_target_date ON predictions(target_date);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_predictions_expires_at ON predictions(expires_at);
CREATE INDEX IF NOT EXISTS idx_predictions_confidence ON predictions(confidence_score);
CREATE INDEX IF NOT EXISTS idx_predictions_accuracy ON predictions(accuracy_score);

-- Create composite index for efficient queries
CREATE INDEX IF NOT EXISTS idx_predictions_composite 
ON predictions(farm_id, prediction_type, target_date DESC);

-- Create model_training_data table for ML training datasets
CREATE TABLE IF NOT EXISTS model_training_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    data_type VARCHAR(50) NOT NULL, -- 'training', 'validation', 'test'
    features JSONB NOT NULL, -- Input features
    target JSONB NOT NULL, -- Target values
    data_source VARCHAR(100), -- Where the data came from
    quality_score DECIMAL(3,2) DEFAULT 1.0,
    weight DECIMAL(5,4) DEFAULT 1.0, -- Sample weight for training
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for model_training_data
CREATE INDEX IF NOT EXISTS idx_training_data_farm_id ON model_training_data(farm_id);
CREATE INDEX IF NOT EXISTS idx_training_data_model ON model_training_data(model_name);
CREATE INDEX IF NOT EXISTS idx_training_data_type ON model_training_data(data_type);
CREATE INDEX IF NOT EXISTS idx_training_data_quality ON model_training_data(quality_score);
CREATE INDEX IF NOT EXISTS idx_training_data_created_at ON model_training_data(created_at);

-- Create model_performance table for tracking model accuracy
CREATE TABLE IF NOT EXISTS model_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    metric_name VARCHAR(50) NOT NULL, -- 'mse', 'mae', 'r2', 'accuracy', 'precision', 'recall'
    metric_value DECIMAL(10,6) NOT NULL,
    evaluation_data JSONB, -- Details about the evaluation
    sample_size INTEGER,
    evaluation_period_start DATE,
    evaluation_period_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for model_performance
CREATE INDEX IF NOT EXISTS idx_model_performance_model ON model_performance(model_name, model_version);
CREATE INDEX IF NOT EXISTS idx_model_performance_farm_id ON model_performance(farm_id);
CREATE INDEX IF NOT EXISTS idx_model_performance_metric ON model_performance(metric_name);
CREATE INDEX IF NOT EXISTS idx_model_performance_created_at ON model_performance(created_at);

-- Create analytics_insights table for automated insights
CREATE TABLE IF NOT EXISTS analytics_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN (
        'anomaly_detection', 'trend_analysis', 'optimization_suggestion',
        'risk_assessment', 'performance_summary', 'recommendation'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    confidence_score DECIMAL(5,4),
    data_sources TEXT[], -- Which data sources were used
    supporting_data JSONB DEFAULT '{}', -- Charts, metrics, etc.
    action_items JSONB DEFAULT '[]', -- Suggested actions
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for analytics_insights
CREATE INDEX IF NOT EXISTS idx_analytics_insights_farm_id ON analytics_insights(farm_id);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_type ON analytics_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_severity ON analytics_insights(severity);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_read ON analytics_insights(is_read);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_archived ON analytics_insights(is_archived);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_created_at ON analytics_insights(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_expires_at ON analytics_insights(expires_at);

-- Create weather_data table for external weather information
CREATE TABLE IF NOT EXISTS weather_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    data_source VARCHAR(50) NOT NULL, -- 'openweather', 'weatherapi', 'manual'
    weather_date DATE NOT NULL,
    temperature_min DECIMAL(5,2),
    temperature_max DECIMAL(5,2),
    temperature_avg DECIMAL(5,2),
    humidity DECIMAL(5,2),
    precipitation DECIMAL(6,2), -- mm
    wind_speed DECIMAL(5,2), -- m/s
    wind_direction INTEGER, -- degrees
    pressure DECIMAL(7,2), -- hPa
    solar_radiation DECIMAL(8,2), -- MJ/m²
    uv_index DECIMAL(3,1),
    conditions VARCHAR(100), -- 'sunny', 'cloudy', 'rainy', etc.
    raw_data JSONB, -- Original API response
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for weather_data
CREATE INDEX IF NOT EXISTS idx_weather_data_farm_id ON weather_data(farm_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_date ON weather_data(weather_date);
CREATE INDEX IF NOT EXISTS idx_weather_data_source ON weather_data(data_source);
CREATE INDEX IF NOT EXISTS idx_weather_data_created_at ON weather_data(created_at);

-- Create unique constraint to prevent duplicate weather data
CREATE UNIQUE INDEX IF NOT EXISTS idx_weather_data_unique 
ON weather_data(farm_id, data_source, weather_date);

-- Create yield_records table for historical yield data
CREATE TABLE IF NOT EXISTS yield_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
    field_zone VARCHAR(100),
    harvest_date DATE NOT NULL,
    area_harvested DECIMAL(10,2), -- hectares or acres
    total_yield DECIMAL(12,2), -- kg or tons
    yield_per_unit DECIMAL(10,4), -- yield per hectare/acre
    quality_grade VARCHAR(50),
    market_price DECIMAL(10,2), -- per unit
    revenue DECIMAL(12,2),
    costs DECIMAL(12,2),
    profit DECIMAL(12,2),
    weather_conditions JSONB, -- Weather during growing season
    farming_practices JSONB, -- Fertilizers, irrigation, etc. used
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for yield_records
CREATE INDEX IF NOT EXISTS idx_yield_records_farm_id ON yield_records(farm_id);
CREATE INDEX IF NOT EXISTS idx_yield_records_crop_id ON yield_records(crop_id);
CREATE INDEX IF NOT EXISTS idx_yield_records_harvest_date ON yield_records(harvest_date);
CREATE INDEX IF NOT EXISTS idx_yield_records_field_zone ON yield_records(field_zone);
CREATE INDEX IF NOT EXISTS idx_yield_records_created_at ON yield_records(created_at);

-- Create data_exports table for tracking data exports
CREATE TABLE IF NOT EXISTS data_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    export_type VARCHAR(50) NOT NULL, -- 'sensor_data', 'predictions', 'insights', 'full_analytics'
    format VARCHAR(20) NOT NULL CHECK (format IN ('csv', 'json', 'xlsx', 'pdf')),
    filters JSONB DEFAULT '{}', -- Export filters applied
    file_path TEXT, -- Where the exported file is stored
    file_size BIGINT, -- File size in bytes
    record_count INTEGER, -- Number of records exported
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    download_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for data_exports
CREATE INDEX IF NOT EXISTS idx_data_exports_farm_id ON data_exports(farm_id);
CREATE INDEX IF NOT EXISTS idx_data_exports_user_id ON data_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_data_exports_type ON data_exports(export_type);
CREATE INDEX IF NOT EXISTS idx_data_exports_status ON data_exports(status);
CREATE INDEX IF NOT EXISTS idx_data_exports_created_at ON data_exports(created_at);
CREATE INDEX IF NOT EXISTS idx_data_exports_expires_at ON data_exports(expires_at);

-- Create function to clean up expired predictions
CREATE OR REPLACE FUNCTION cleanup_expired_predictions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM predictions 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Create function to calculate prediction accuracy
CREATE OR REPLACE FUNCTION update_prediction_accuracy(
    prediction_id UUID,
    actual_value DECIMAL,
    tolerance DECIMAL DEFAULT 0.1
)
RETURNS DECIMAL AS $$
DECLARE
    predicted_value DECIMAL;
    accuracy DECIMAL;
BEGIN
    -- Get the predicted value from the prediction
    SELECT (output_data->>'value')::DECIMAL INTO predicted_value
    FROM predictions 
    WHERE id = prediction_id;
    
    IF predicted_value IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Calculate accuracy (1 - normalized error)
    accuracy := 1.0 - LEAST(ABS(predicted_value - actual_value) / GREATEST(ABS(actual_value), tolerance), 1.0);
    
    -- Update the prediction record
    UPDATE predictions 
    SET accuracy_score = accuracy
    WHERE id = prediction_id;
    
    RETURN accuracy;
END;
$$ language 'plpgsql';

-- Create view for latest predictions by type
CREATE OR REPLACE VIEW latest_predictions AS
SELECT DISTINCT ON (farm_id, prediction_type)
    id,
    farm_id,
    model_name,
    model_version,
    prediction_type,
    output_data,
    confidence_score,
    prediction_horizon,
    target_date,
    accuracy_score,
    created_at,
    expires_at,
    CASE 
        WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 'expired'
        WHEN confidence_score < 0.7 THEN 'low_confidence'
        WHEN target_date < CURRENT_DATE THEN 'past_due'
        ELSE 'active'
    END as status
FROM predictions
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY farm_id, prediction_type, created_at DESC;

-- Create view for model performance summary
CREATE OR REPLACE VIEW model_performance_summary AS
SELECT 
    model_name,
    model_version,
    COUNT(DISTINCT farm_id) as farms_count,
    AVG(CASE WHEN metric_name = 'accuracy' THEN metric_value END) as avg_accuracy,
    AVG(CASE WHEN metric_name = 'mse' THEN metric_value END) as avg_mse,
    AVG(CASE WHEN metric_name = 'mae' THEN metric_value END) as avg_mae,
    AVG(CASE WHEN metric_name = 'r2' THEN metric_value END) as avg_r2,
    COUNT(*) as total_evaluations,
    MAX(created_at) as last_evaluation
FROM model_performance
GROUP BY model_name, model_version
ORDER BY model_name, model_version;

-- Create view for analytics dashboard
CREATE OR REPLACE VIEW analytics_dashboard AS
SELECT 
    f.id as farm_id,
    f.name as farm_name,
    COUNT(DISTINCT s.id) as sensor_count,
    COUNT(DISTINCT p.id) as prediction_count,
    COUNT(DISTINCT ai.id) as insight_count,
    COUNT(DISTINCT CASE WHEN ai.severity = 'critical' THEN ai.id END) as critical_insights,
    COUNT(DISTINCT CASE WHEN ai.is_read = false THEN ai.id END) as unread_insights,
    AVG(p.confidence_score) as avg_prediction_confidence,
    MAX(s.last_reading_at) as last_sensor_reading,
    MAX(p.created_at) as last_prediction,
    MAX(ai.created_at) as last_insight
FROM farms f
LEFT JOIN iot_sensors s ON f.id = s.farm_id AND s.is_active = true
LEFT JOIN predictions p ON f.id = p.farm_id AND p.created_at >= NOW() - INTERVAL '7 days'
LEFT JOIN analytics_insights ai ON f.id = ai.farm_id AND ai.is_archived = false
GROUP BY f.id, f.name
ORDER BY f.name;

-- Insert sample weather data for existing farms
INSERT INTO weather_data (
    farm_id, data_source, weather_date, temperature_min, temperature_max, 
    temperature_avg, humidity, precipitation, wind_speed, conditions
)
SELECT 
    f.id,
    'sample',
    CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 6),
    15 + random() * 10, -- min temp
    25 + random() * 15, -- max temp
    20 + random() * 10, -- avg temp
    40 + random() * 40, -- humidity
    random() * 10, -- precipitation
    random() * 15, -- wind speed
    CASE 
        WHEN random() < 0.3 THEN 'sunny'
        WHEN random() < 0.6 THEN 'cloudy'
        ELSE 'partly_cloudy'
    END
FROM farms f
CROSS JOIN generate_series(0, 6)
WHERE NOT EXISTS (
    SELECT 1 FROM weather_data 
    WHERE farm_id = f.id AND data_source = 'sample'
);

-- Insert sample analytics insights
INSERT INTO analytics_insights (
    farm_id, insight_type, title, description, severity, confidence_score, data_sources
)
SELECT 
    f.id,
    insight_data.type,
    insight_data.title,
    insight_data.description,
    insight_data.severity,
    insight_data.confidence,
    insight_data.sources
FROM farms f
CROSS JOIN (
    VALUES 
        ('trend_analysis', 'Temperature Trend Alert', 'Average temperature has increased by 3°C over the past week', 'warning', 0.85, ARRAY['iot_sensors', 'weather_data']),
        ('optimization_suggestion', 'Irrigation Optimization', 'Soil moisture levels suggest reducing irrigation frequency by 20%', 'info', 0.78, ARRAY['iot_sensors', 'weather_forecast']),
        ('anomaly_detection', 'Unusual pH Levels', 'pH sensor readings are outside normal range for this crop type', 'critical', 0.92, ARRAY['iot_sensors', 'historical_data']),
        ('recommendation', 'Harvest Timing', 'Weather forecast suggests optimal harvest window in 5-7 days', 'info', 0.73, ARRAY['weather_forecast', 'crop_models'])
) AS insight_data(type, title, description, severity, confidence, sources)
WHERE NOT EXISTS (
    SELECT 1 FROM analytics_insights 
    WHERE farm_id = f.id AND insight_type = insight_data.type
);