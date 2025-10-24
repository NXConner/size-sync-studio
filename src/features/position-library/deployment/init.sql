-- Database initialization script for Position Library
-- This script sets up the initial database structure and sample data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_position_history_user_id ON position_history(user_id);
CREATE INDEX IF NOT EXISTS idx_position_history_timestamp ON position_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_posts_content_search ON posts USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_custom_positions_search ON custom_positions USING gin(to_tsvector('english', name || ' ' || description));

-- Insert sample achievements
INSERT INTO achievements (id, name, category, type, description, requirements, rewards, difficulty, is_public, created_at, updated_at) VALUES
('ach-001', 'First Steps', 'exploration', 'milestone', 'Complete your first position', '["Complete 1 position"]', '["Welcome badge"]', 'beginner', true, NOW(), NOW()),
('ach-002', 'Explorer', 'exploration', 'milestone', 'Try 5 different positions', '["Try 5 different positions"]', '["Explorer badge"]', 'beginner', true, NOW(), NOW()),
('ach-003', 'Endurance Master', 'endurance', 'milestone', 'Complete a 30-minute session', '["Complete a 30-minute session"]', '["Endurance badge"]', 'intermediate', true, NOW(), NOW()),
('ach-004', 'Position Creator', 'creativity', 'milestone', 'Create your first custom position', '["Create 1 custom position"]', '["Creator badge"]', 'beginner', true, NOW(), NOW()),
('ach-005', 'Community Helper', 'social', 'milestone', 'Share your first post', '["Share 1 post"]', '["Helper badge"]', 'beginner', true, NOW(), NOW()),
('ach-006', 'Challenge Seeker', 'challenge', 'milestone', 'Complete your first challenge', '["Complete 1 challenge"]', '["Challenger badge"]', 'beginner', true, NOW(), NOW()),
('ach-007', 'Analytics Enthusiast', 'tracking', 'milestone', 'Track 10 sessions', '["Track 10 sessions"]', '["Analyst badge"]', 'beginner', true, NOW(), NOW()),
('ach-008', 'Personalization Pro', 'customization', 'milestone', 'Set up your preferences', '["Set preferences"]', '["Personalizer badge"]', 'beginner', true, NOW(), NOW()),
('ach-009', 'Advanced Explorer', 'exploration', 'milestone', 'Try 20 different positions', '["Try 20 different positions"]', '["Advanced Explorer badge"]', 'advanced', true, NOW(), NOW()),
('ach-010', 'Marathon Master', 'endurance', 'milestone', 'Complete a 60-minute session', '["Complete a 60-minute session"]', '["Marathon badge"]', 'advanced', true, NOW(), NOW());

-- Insert sample challenges
INSERT INTO challenges (id, user_id, name, description, type, difficulty, duration, requirements, rewards, status, progress, max_progress, created_at, updated_at) VALUES
('chall-001', 'system', 'Weekend Warrior', 'Complete 3 sessions this weekend', 'endurance', 'beginner', 10080, '["Complete 3 sessions in 2 days"]', '["Weekend Warrior badge", "50 points"]', 'pending', 0, 100, NOW(), NOW()),
('chall-002', 'system', 'Exploration Week', 'Try 7 different positions this week', 'exploration', 'intermediate', 10080, '["Try 7 different positions in 7 days"]', '["Explorer badge", "100 points"]', 'pending', 0, 100, NOW(), NOW()),
('chall-003', 'system', 'Endurance Challenge', 'Complete a 45-minute session', 'endurance', 'advanced', 45, '["Complete one 45-minute session"]', '["Endurance Master badge", "200 points"]', 'pending', 0, 100, NOW(), NOW()),
('chall-004', 'system', 'Creative Creator', 'Create 3 custom positions', 'creativity', 'intermediate', 20160, '["Create 3 custom positions in 2 weeks"]', '["Creator badge", "150 points"]', 'pending', 0, 100, NOW(), NOW()),
('chall-005', 'system', 'Community Champion', 'Get 10 likes on your posts', 'social', 'intermediate', 20160, '["Get 10 total likes on posts"]', '["Community Champion badge", "100 points"]', 'pending', 0, 100, NOW(), NOW());

-- Insert sample public positions
INSERT INTO custom_positions (id, user_id, name, description, instructions, tips, difficulty, category, mood, duration, intensity, tags, is_public, created_at, updated_at) VALUES
('pos-001', 'system', 'Classic Missionary', 'The traditional and intimate position', '["Partner lies on back", "Other partner positions on top", "Face each other for intimacy"]', '["Use pillows for comfort", "Maintain eye contact", "Communicate preferences"]', 'beginner', 'missionary', 'romantic', 15, 'medium', '["traditional", "intimate", "beginner"]', true, NOW(), NOW()),
('pos-002', 'system', 'Cowgirl', 'The partner takes control from above', '["Receiving partner lies on back", "Active partner straddles", "Active partner controls rhythm"]', '["Use hands for support", "Communicate about pace", "Try different angles"]', 'beginner', 'cowgirl', 'playful', 20, 'medium', '["control", "playful", "beginner"]', true, NOW(), NOW()),
('pos-003', 'system', 'Spooning', 'Intimate side-by-side position', '["Both partners lie on sides", "One partner behind the other", "Gentle rocking motion"]', '["Use pillows for comfort", "Synchronize breathing", "Gentle and intimate"]', 'beginner', 'spooning', 'romantic', 25, 'low', '["intimate", "gentle", "romantic"]', true, NOW(), NOW()),
('pos-004', 'system', 'Standing Intimacy', 'Passionate standing position', '["Both partners stand", "One partner leans against wall", "Face to face connection"]', '["Ensure stability", "Use wall for support", "Communicate about height differences"]', 'intermediate', 'standing', 'passionate', 10, 'high', '["passionate", "standing", "intermediate"]', true, NOW(), NOW()),
('pos-005', 'system', 'Reverse Cowgirl', 'Variation with partner facing away', '["Receiving partner lies on back", "Active partner straddles facing away", "Active partner controls movement"]', '["Different angle of penetration", "Use hands for support", "Try different speeds"]', 'intermediate', 'cowgirl', 'playful', 20, 'medium', '["variation", "playful", "intermediate"]', true, NOW(), NOW());

-- Create views for analytics
CREATE OR REPLACE VIEW user_analytics_summary AS
SELECT 
    u.id as user_id,
    u.name,
    COUNT(s.id) as total_sessions,
    COALESCE(SUM(s.duration), 0) as total_duration,
    COALESCE(AVG(s.duration), 0) as avg_session_duration,
    COALESCE(SUM(array_length(s.positions, 1)), 0) as total_positions,
    COALESCE(AVG(array_length(s.positions, 1)), 0) as avg_positions_per_session
FROM users u
LEFT JOIN sessions s ON u.id = s.user_id
GROUP BY u.id, u.name;

CREATE OR REPLACE VIEW popular_positions AS
SELECT 
    unnest(positions) as position_name,
    COUNT(*) as usage_count,
    AVG(duration) as avg_duration
FROM sessions
WHERE positions IS NOT NULL
GROUP BY unnest(positions)
ORDER BY usage_count DESC;

CREATE OR REPLACE VIEW achievement_progress AS
SELECT 
    ua.user_id,
    a.name as achievement_name,
    a.category,
    a.difficulty,
    ua.progress,
    a.requirements,
    CASE 
        WHEN ua.unlocked_at IS NOT NULL THEN 'unlocked'
        WHEN ua.progress >= a.requirements::int THEN 'ready'
        ELSE 'in_progress'
    END as status
FROM user_achievements ua
JOIN achievements a ON ua.achievement_id = a.id;

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_user_analytics(user_id_param TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO analytics (user_id, total_sessions, total_duration, total_positions, created_at, updated_at)
    SELECT 
        user_id_param,
        COUNT(*),
        COALESCE(SUM(duration), 0),
        COALESCE(SUM(array_length(positions, 1)), 0),
        NOW(),
        NOW()
    FROM sessions 
    WHERE user_id = user_id_param
    ON CONFLICT (user_id) 
    DO UPDATE SET
        total_sessions = EXCLUDED.total_sessions,
        total_duration = EXCLUDED.total_duration,
        total_positions = EXCLUDED.total_positions,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_achievement_progress(user_id_param TEXT, achievement_id_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    achievement_requirements TEXT[];
    current_progress INTEGER;
BEGIN
    SELECT requirements INTO achievement_requirements
    FROM achievements 
    WHERE id = achievement_id_param;
    
    -- This is a simplified check - in reality, you'd have more complex logic
    -- based on the specific achievement requirements
    SELECT progress INTO current_progress
    FROM user_achievements 
    WHERE user_id = user_id_param AND achievement_id = achievement_id_param;
    
    RETURN current_progress >= 100;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION trigger_update_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_user_analytics(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analytics_after_session
    AFTER INSERT OR UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_analytics();

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO position_library_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO position_library_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO position_library_user;
