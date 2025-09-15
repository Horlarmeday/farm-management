-- Create push_subscriptions table for web push notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient user lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active);

-- Create unique constraint on endpoint to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('push', 'email', 'sms')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('alerts', 'reminders', 'updates', 'reports')),
    enabled BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for notification preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_type ON notification_preferences(type);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_category ON notification_preferences(category);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_enabled ON notification_preferences(enabled);

-- Create unique constraint to prevent duplicate preferences
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_preferences_unique 
ON notification_preferences(user_id, type, category);

-- Create alert_rules table for automated alert configuration
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL DEFAULT '[]',
    actions JSONB NOT NULL DEFAULT '[]',
    enabled BOOLEAN DEFAULT true,
    cooldown INTEGER DEFAULT 30, -- minutes
    last_triggered TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for alert rules
CREATE INDEX IF NOT EXISTS idx_alert_rules_farm_id ON alert_rules(farm_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON alert_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_alert_rules_last_triggered ON alert_rules(last_triggered);

-- Create alert_logs table to track triggered alerts
CREATE TABLE IF NOT EXISTS alert_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    trigger_data JSONB NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for alert logs
CREATE INDEX IF NOT EXISTS idx_alert_logs_rule_id ON alert_logs(alert_rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_logs_farm_id ON alert_logs(farm_id);
CREATE INDEX IF NOT EXISTS idx_alert_logs_severity ON alert_logs(severity);
CREATE INDEX IF NOT EXISTS idx_alert_logs_acknowledged ON alert_logs(acknowledged);
CREATE INDEX IF NOT EXISTS idx_alert_logs_resolved ON alert_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_alert_logs_created_at ON alert_logs(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_push_subscriptions_updated_at 
    BEFORE UPDATE ON push_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at 
    BEFORE UPDATE ON notification_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at 
    BEFORE UPDATE ON alert_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id, type, category, enabled, settings)
SELECT 
    u.id,
    pref.type,
    pref.category,
    pref.enabled,
    pref.settings::jsonb
FROM users u
CROSS JOIN (
    VALUES 
        ('push', 'alerts', true, '{"frequency": "immediate", "priority": "high"}'),
        ('push', 'reminders', true, '{"frequency": "immediate", "priority": "medium"}'),
        ('push', 'updates', false, '{"frequency": "daily", "priority": "low"}'),
        ('push', 'reports', false, '{"frequency": "weekly", "priority": "low"}'),
        ('email', 'alerts', true, '{"frequency": "immediate", "priority": "high"}'),
        ('email', 'reminders', true, '{"frequency": "daily", "priority": "medium"}'),
        ('email', 'updates', false, '{"frequency": "weekly", "priority": "low"}'),
        ('email', 'reports', true, '{"frequency": "weekly", "priority": "medium"}'),
        ('sms', 'alerts', false, '{"frequency": "immediate", "priority": "critical"}'),
        ('sms', 'reminders', false, '{"frequency": "immediate", "priority": "high"}'),
        ('sms', 'updates', false, '{"frequency": "never", "priority": "low"}'),
        ('sms', 'reports', false, '{"frequency": "never", "priority": "low"}')
) AS pref(type, category, enabled, settings)
ON CONFLICT (user_id, type, category) DO NOTHING;