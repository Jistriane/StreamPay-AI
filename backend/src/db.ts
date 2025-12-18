import { Pool, PoolClient, QueryResult } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "streampay",
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
});

/**
 * Executa uma query no pool
 */
export async function query(
    text: string,
    params?: any[]
): Promise<QueryResult> {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        if (duration > 1000) {
            console.warn(`Slow query (${duration}ms): ${text}`);
        }

        return result;
    } catch (error) {
        console.error("Database query error:", error);
        throw error;
    }
}

/**
 * Obtém um client para transações
 */
export async function getClient(): Promise<PoolClient> {
    return pool.connect();
}

// ===== EVENT HANDLERS =====

export async function saveStreamCreated(event: any) {
    await pool.query(
        "INSERT INTO stream_events (type, stream_id, sender, recipient, token, rate_per_second, duration, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())",
        [
            "StreamCreated",
            event.streamId,
            event.sender,
            event.recipient,
            event.token,
            event.ratePerSecond,
            event.duration,
        ]
    );
}

export async function saveStreamClaimed(event: any) {
    await pool.query(
        "INSERT INTO stream_events (type, stream_id, recipient, amount, timestamp) VALUES ($1, $2, $3, $4, NOW())",
        [
            "StreamClaimed",
      event.streamId,
      event.recipient,
      event.amount
    ]
  );
}

export async function migrateEvents() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stream_events (
      id SERIAL PRIMARY KEY,
      type TEXT,
      stream_id TEXT,
      sender TEXT,
      recipient TEXT,
      token TEXT,
      rate_per_second TEXT,
      duration TEXT,
      amount TEXT,
      timestamp TIMESTAMP
    );
  `);
}

export async function createStream(stream: any) {
  await pool.query(
    "INSERT INTO streams (recipient, token, rate, duration, active, sender) VALUES ($1, $2, $3, $4, $5, $6)",
    [stream.recipient, stream.token, stream.rate, stream.duration, stream.active, stream.sender]
  );
}

export async function getStreamsBySender(sender: string) {
  const result = await pool.query("SELECT * FROM streams WHERE sender = $1", [sender]);
  return result.rows;
}

export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS streams (
      id SERIAL PRIMARY KEY,
      recipient TEXT,
      token TEXT,
      rate TEXT,
      duration INTEGER,
      active BOOLEAN,
      sender TEXT
    );
  `);
}
