-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    address VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    CONSTRAINT valid_address CHECK (address ~ '^0x[a-fA-F0-9]{40}$')
);

CREATE INDEX idx_users_address ON users(address);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;

-- Streams table
CREATE TABLE IF NOT EXISTS streams (
    id SERIAL PRIMARY KEY,
    sender VARCHAR(42) NOT NULL,
    recipient VARCHAR(42) NOT NULL,
    token VARCHAR(42) NOT NULL,
    deposit NUMERIC(78, 0) NOT NULL,
    rate_per_second NUMERIC(78, 0) NOT NULL,
    duration INTEGER NOT NULL,
    start_time TIMESTAMP,
    stop_time TIMESTAMP,
    remaining_balance NUMERIC(78, 0),
    active BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_streams_sender ON streams(sender);
CREATE INDEX idx_streams_recipient ON streams(recipient);
CREATE INDEX idx_streams_active ON streams(active);
CREATE INDEX idx_streams_status ON streams(status);

-- Stream claims
CREATE TABLE IF NOT EXISTS stream_claims (
    id SERIAL PRIMARY KEY,
    stream_id INTEGER NOT NULL REFERENCES streams(id),
    recipient VARCHAR(42) NOT NULL,
    amount NUMERIC(78, 0),
    status VARCHAR(50) DEFAULT 'pending',
    tx_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stream_claims_stream_id ON stream_claims(stream_id);
CREATE INDEX idx_stream_claims_recipient ON stream_claims(recipient);
CREATE INDEX idx_stream_claims_status ON stream_claims(status);

-- Stream events (auditoria)
CREATE TABLE IF NOT EXISTS stream_events (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    stream_id INTEGER REFERENCES streams(id),
    sender VARCHAR(42),
    recipient VARCHAR(42),
    token VARCHAR(42),
    amount NUMERIC(78, 0),
    rate_per_second NUMERIC(78, 0),
    duration INTEGER,
    block_number INTEGER,
    tx_hash VARCHAR(66),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stream_events_stream_id ON stream_events(stream_id);
CREATE INDEX idx_stream_events_type ON stream_events(type);
CREATE INDEX idx_stream_events_timestamp ON stream_events(timestamp);

-- Liquidity pools
CREATE TABLE IF NOT EXISTS liquidity_pools (
    id SERIAL PRIMARY KEY,
    token0 VARCHAR(42) NOT NULL,
    token1 VARCHAR(42) NOT NULL,
    reserve0 NUMERIC(78, 0) DEFAULT 0,
    reserve1 NUMERIC(78, 0) DEFAULT 0,
    total_shares NUMERIC(78, 0) DEFAULT 0,
    creator VARCHAR(42) NOT NULL,
    fee_tier INTEGER DEFAULT 3000,
    active BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_liquidity_pools_tokens ON liquidity_pools(token0, token1);
CREATE INDEX idx_liquidity_pools_creator ON liquidity_pools(creator);
CREATE INDEX idx_liquidity_pools_active ON liquidity_pools(active);

-- LP positions
CREATE TABLE IF NOT EXISTS lp_positions (
    id SERIAL PRIMARY KEY,
    pool_id INTEGER NOT NULL REFERENCES liquidity_pools(id),
    provider VARCHAR(42) NOT NULL,
    amount0 NUMERIC(78, 0) NOT NULL,
    amount1 NUMERIC(78, 0) NOT NULL,
    shares NUMERIC(78, 0),
    uniswap_position_id BIGINT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lp_positions_pool_id ON lp_positions(pool_id);
CREATE INDEX idx_lp_positions_provider ON lp_positions(provider);
CREATE INDEX idx_lp_positions_status ON lp_positions(status);

-- LP removals
CREATE TABLE IF NOT EXISTS lp_removals (
    id SERIAL PRIMARY KEY,
    position_id INTEGER NOT NULL REFERENCES lp_positions(id),
    pool_id INTEGER NOT NULL REFERENCES liquidity_pools(id),
    provider VARCHAR(42) NOT NULL,
    shares NUMERIC(78, 0) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    tx_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lp_removals_pool_id ON lp_removals(pool_id);
CREATE INDEX idx_lp_removals_provider ON lp_removals(provider);
CREATE INDEX idx_lp_removals_status ON lp_removals(status);

-- Swaps (auditoria)
CREATE TABLE IF NOT EXISTS swaps (
    id SERIAL PRIMARY KEY,
    pool_id INTEGER REFERENCES liquidity_pools(id),
    user_address VARCHAR(42) NOT NULL,
    token_in VARCHAR(42) NOT NULL,
    token_out VARCHAR(42) NOT NULL,
    amount_in NUMERIC(78, 0) NOT NULL,
    amount_out NUMERIC(78, 0) NOT NULL,
    fee NUMERIC(78, 0),
    slippage_bps INTEGER,
    block_number INTEGER,
    tx_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_swaps_pool_id ON swaps(pool_id);
CREATE INDEX idx_swaps_user ON swaps(user_address);
CREATE INDEX idx_swaps_timestamp ON swaps(created_at);

-- Webhooks (para Moralis, Chainlink, etc)
CREATE TABLE IF NOT EXISTS webhooks (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX idx_webhooks_event_type ON webhooks(event_type);
CREATE INDEX idx_webhooks_source ON webhooks(source);
CREATE INDEX idx_webhooks_processed ON webhooks(processed);
CREATE INDEX idx_webhooks_created_at ON webhooks(created_at);
