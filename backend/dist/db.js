"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveStreamCreated = saveStreamCreated;
exports.saveStreamClaimed = saveStreamClaimed;
exports.migrateEvents = migrateEvents;
exports.createStream = createStream;
exports.getStreamsBySender = getStreamsBySender;
exports.migrate = migrate;
async function saveStreamCreated(event) {
    await pool.query("INSERT INTO stream_events (type, stream_id, sender, recipient, token, rate_per_second, duration, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())", [
        "StreamCreated",
        event.streamId,
        event.sender,
        event.recipient,
        event.token,
        event.ratePerSecond,
        event.duration
    ]);
}
async function saveStreamClaimed(event) {
    await pool.query("INSERT INTO stream_events (type, stream_id, recipient, amount, timestamp) VALUES ($1, $2, $3, $4, NOW())", [
        "StreamClaimed",
        event.streamId,
        event.recipient,
        event.amount
    ]);
}
async function migrateEvents() {
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
// Módulo de conexão e operações básicas com Postgres para persistência real
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.POSTGRES_URL || "postgresql://postgres:1234@localhost:5432/streampay?schema=public"
});
async function createStream(stream) {
    await pool.query("INSERT INTO streams (recipient, token, rate, duration, active, sender) VALUES ($1, $2, $3, $4, $5, $6)", [stream.recipient, stream.token, stream.rate, stream.duration, stream.active, stream.sender]);
}
async function getStreamsBySender(sender) {
    const result = await pool.query("SELECT * FROM streams WHERE sender = $1", [sender]);
    return result.rows;
}
async function migrate() {
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
