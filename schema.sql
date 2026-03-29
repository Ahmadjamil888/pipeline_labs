
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================================
-- 1. PROFILES (User profiles linked to Clerk)
-- ==========================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    
    -- Subscription/Plan
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
    
    -- Usage tracking
    datasets_processed INTEGER DEFAULT 0,
    rows_processed INTEGER DEFAULT 0,
    
    -- Preferences
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 2. PLANS (Pricing tiers)
-- ==========================================================

CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    
    -- Pricing (in cents)
    price_monthly INTEGER NOT NULL,
    price_annual INTEGER,
    currency TEXT DEFAULT 'usd',
    
    -- Limits
    max_datasets_per_month INTEGER,
    max_rows_per_dataset INTEGER,
    max_file_size_mb INTEGER,
    
    -- Features
    features JSONB DEFAULT '[]'::jsonb,
    
    -- Display
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 3. SUBSCRIPTIONS (User billing)
-- ==========================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    
    -- External integration
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'incomplete' 
        CHECK (status IN ('incomplete', 'trialing', 'active', 'past_due', 'canceled')),
    
    -- Billing
    billing_interval TEXT NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month', 'year')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    
    -- Usage tracking for period
    datasets_used_this_period INTEGER DEFAULT 0,
    rows_processed_this_period INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- ==========================================================
-- 4. API KEYS (Pre-generated for each user)
-- ==========================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- The API key (shown only once to user, prefix stored for display)
    key_prefix TEXT NOT NULL, -- e.g., "pl_live_abc12"
    key_hash TEXT NOT NULL,   -- bcrypt hash for verification
    key_full TEXT,            -- encrypted full key (shown once on creation)
    
    -- Metadata
    name TEXT DEFAULT 'Default API Key',
    description TEXT,
    
    -- Usage tracking
    last_used_at TIMESTAMPTZ,
    total_requests INTEGER DEFAULT 0,
    
    -- Rate limiting (requests per minute)
    rate_limit_per_minute INTEGER DEFAULT 60,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 5. DATASETS (Uploaded files)
-- ==========================================================

CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- File info
    name TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size_bytes INTEGER,
    file_type TEXT NOT NULL CHECK (file_type IN ('csv', 'excel', 'json', 'parquet')),
    
    -- Storage (Supabase Storage)
    storage_path TEXT NOT NULL,
    storage_url TEXT,
    
    -- Dataset metadata (auto-detected on upload)
    row_count INTEGER,
    column_count INTEGER,
    columns JSONB, -- [{name, type, sample_values, null_count}]
    
    -- Status
    status TEXT NOT NULL DEFAULT 'uploaded' 
        CHECK (status IN ('uploaded', 'processing', 'processed', 'error')),
    
    -- Metadata
    description TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 6. PROCESSING JOBS (AI preprocessing requests)
-- ==========================================================

CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    
    -- Input
    prompt TEXT NOT NULL, -- User's natural language instruction
    
    -- AI-generated pipeline plan
    detected_intent TEXT, -- "classification_prep", "outlier_removal", "normalization", etc.
    generated_plan JSONB, -- {steps: [], reasoning: ""}
    
    -- Output
    output_dataset_id UUID REFERENCES datasets(id) ON DELETE SET NULL,
    
    -- Execution status
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'analyzing', 'planning', 'processing', 'complete', 'failed')),
    
    -- Execution messages for UI display (step-by-step progress)
    progress_messages JSONB DEFAULT '[]'::jsonb, -- [{step: 1, message: "Analyzing data...", timestamp: "..."}]
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    
    -- Results
    transformations_applied JSONB, -- Detailed log of what was done
    rows_affected INTEGER,
    columns_affected INTEGER,
    
    -- Error handling
    error_message TEXT,
    error_details JSONB,
    
    -- Preview (first 10-20 rows for display)
    preview_data JSONB,
    
    -- Download info
    download_url TEXT,
    download_expires_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 7. TRANSFORMATIONS (Individual steps applied)
-- ==========================================================

CREATE TABLE IF NOT EXISTS transformations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES processing_jobs(id) ON DELETE CASCADE,
    
    step_order INTEGER NOT NULL,
    step_type TEXT NOT NULL CHECK (step_type IN (
        'detect_types', 'fill_missing', 'remove_outliers', 
        'normalize', 'encode_categorical', 'scale_features',
        'drop_columns', 'rename_columns', 'create_features',
        'remove_duplicates', 'fix_data_types'
    )),
    
    description TEXT NOT NULL,
    parameters JSONB, -- {column: "age", method: "mean", ...}
    
    -- Stats
    rows_affected INTEGER,
    columns_affected INTEGER,
    
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'running', 'success', 'failed', 'skipped')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 8. ACTIVITY LOGS
-- ==========================================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    action TEXT NOT NULL, -- dataset.upload, job.create, job.complete, etc.
    entity_type TEXT NOT NULL, -- dataset, job, transformation
    entity_id UUID,
    
    ip_address INET,
    user_agent TEXT,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- INDEXES
-- ==========================================================

-- Profiles
CREATE INDEX idx_profiles_clerk ON profiles(clerk_user_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- API Keys
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = TRUE;

-- Datasets
CREATE INDEX idx_datasets_user ON datasets(user_id);
CREATE INDEX idx_datasets_status ON datasets(status);
CREATE INDEX idx_datasets_created ON datasets(created_at DESC);
CREATE INDEX idx_datasets_deleted ON datasets(is_deleted) WHERE is_deleted = FALSE;

-- Processing Jobs
CREATE INDEX idx_jobs_user ON processing_jobs(user_id);
CREATE INDEX idx_jobs_dataset ON processing_jobs(dataset_id);
CREATE INDEX idx_jobs_status ON processing_jobs(status);
CREATE INDEX idx_jobs_created ON processing_jobs(created_at DESC);

-- Transformations
CREATE INDEX idx_transformations_job ON transformations(job_id);

-- Activity
CREATE INDEX idx_activity_user ON activity_logs(user_id, created_at DESC);

-- ==========================================================
-- FUNCTIONS
-- ==========================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Generate API key for new user
CREATE OR REPLACE FUNCTION generate_api_key_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_key TEXT;
    key_prefix TEXT;
BEGIN
    -- Generate random key
    new_key := 'pl_live_' || encode(gen_random_bytes(32), 'hex');
    key_prefix := substring(new_key from 1 for 16) || '...';
    
    -- Insert API key for the new user
    INSERT INTO api_keys (user_id, key_prefix, key_hash, key_full, name)
    VALUES (
        NEW.id,
        key_prefix,
        crypt(new_key, gen_salt('bf')), -- bcrypt hash
        new_key, -- store full key temporarily (shown once)
        'Default API Key'
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================================
-- TRIGGERS
-- ==========================================================

-- Update timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON datasets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processing_jobs_updated_at BEFORE UPDATE ON processing_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transformations_updated_at BEFORE UPDATE ON transformations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate API key when profile is created
CREATE TRIGGER create_profile_api_key
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION generate_api_key_for_new_user();

-- ==========================================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can only access their own profile
CREATE POLICY profiles_own ON profiles
    FOR ALL USING (clerk_user_id = (select auth.jwt()->>'sub'));

-- API Keys: Users can manage their own keys
CREATE POLICY api_keys_own ON api_keys
    FOR ALL USING (
        user_id IN (
            SELECT id FROM profiles WHERE clerk_user_id = (select auth.jwt()->>'sub')
        )
    );

-- Datasets: Users can access their own datasets
CREATE POLICY datasets_own ON datasets
    FOR ALL USING (
        user_id IN (
            SELECT id FROM profiles WHERE clerk_user_id = (select auth.jwt()->>'sub')
        )
        AND is_deleted = FALSE
    );

-- Processing Jobs: Users can access their own jobs
CREATE POLICY jobs_own ON processing_jobs
    FOR ALL USING (
        user_id IN (
            SELECT id FROM profiles WHERE clerk_user_id = (select auth.jwt()->>'sub')
        )
    );

-- Transformations: Access through jobs
CREATE POLICY transformations_own ON transformations
    FOR ALL USING (
        job_id IN (
            SELECT id FROM processing_jobs WHERE user_id IN (
                SELECT id FROM profiles WHERE clerk_user_id = (select auth.jwt()->>'sub')
            )
        )
    );

-- Subscriptions: Users can view their own
CREATE POLICY subscriptions_own ON subscriptions
    FOR ALL USING (
        user_id IN (
            SELECT id FROM profiles WHERE clerk_user_id = (select auth.jwt()->>'sub')
        )
    );

-- Activity logs: Users can view their own
CREATE POLICY activity_own ON activity_logs
    FOR ALL USING (
        user_id IN (
            SELECT id FROM profiles WHERE clerk_user_id = (select auth.jwt()->>'sub')
        )
    );

-- ==========================================================
-- SEED DATA - Pricing Plans
-- ==========================================================

INSERT INTO plans (name, slug, description, price_monthly, price_annual, max_datasets_per_month, max_rows_per_dataset, max_file_size_mb, features, display_order) VALUES
(
    'Free',
    'free',
    'Perfect for experimenting and small datasets',
    0,
    0,
    10,
    10000,
    10,
    '["10 datasets/month", "10K rows max", "CSV & Excel support", "Basic AI transformations", "Community support", "1 API key"]'::jsonb,
    1
),
(
    'Pro',
    'pro',
    'For professionals working with larger datasets',
    2900,
    2900,
    100,
    100000,
    100,
    '["100 datasets/month", "100K rows max", "All file formats", "Advanced AI transformations", "Priority support", "API access", "5 API keys"]'::jsonb,
    2
),
(
    'Team',
    'team',
    'For teams with heavy data processing needs',
    10900,
    10900,
    NULL,
    1000000,
    500,
    '["Unlimited datasets", "1M rows max", "All file formats", "Custom AI pipelines", "SSO/SAML", "Dedicated support", "Unlimited API keys"]'::jsonb,
    3
)
ON CONFLICT (slug) DO NOTHING;

-- ==========================================================
-- VIEWS
-- ==========================================================

-- User dashboard stats
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT 
    p.id as profile_id,
    p.clerk_user_id,
    p.email,
    p.full_name,
    p.plan,
    
    -- API keys
    (SELECT COUNT(*) FROM api_keys WHERE user_id = p.id AND is_active = TRUE) as active_api_keys,
    
    -- Dataset stats
    COUNT(DISTINCT d.id) as total_datasets,
    COUNT(DISTINCT CASE WHEN d.status = 'processed' THEN d.id END) as processed_datasets,
    COALESCE(SUM(d.row_count), 0) as total_rows_uploaded,
    
    -- Job stats
    COUNT(DISTINCT j.id) as total_jobs,
    COUNT(DISTINCT CASE WHEN j.status = 'complete' THEN j.id END) as successful_jobs,
    COALESCE(SUM(j.rows_affected), 0) as total_rows_processed,
    
    -- Recent activity
    MAX(j.created_at) as last_job_at

FROM profiles p
LEFT JOIN datasets d ON d.user_id = p.id AND d.is_deleted = FALSE
LEFT JOIN processing_jobs j ON j.user_id = p.id
GROUP BY p.id, p.clerk_user_id, p.email, p.full_name, p.plan;

-- ==========================================================
-- DONE!
-- ==========================================================
