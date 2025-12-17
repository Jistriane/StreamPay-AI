"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
exports.getClient = getClient;
exports.saveStreamCreated = saveStreamCreated;
exports.saveStreamClaimed = saveStreamClaimed;
exports.migrateEvents = migrateEvents;
exports.createStream = createStream;
exports.getStreamsBySender = getStreamsBySender;
exports.migrate = migrate;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.pool = new pg_1.Pool({
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "streampay",
});
exports.pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
});
/**
 * Executa uma query no pool
 */
async function query(text, params) {
    const start = Date.now();
    try {
        const result = await exports.pool.query(text, params);
        const duration = Date.now() - start;
        if (duration > 1000) {
            console.warn(`Slow query (${duration}ms): ${text}`);
        }
        return result;
    }
    catch (error) {
        console.error("Database query error:", error);
        throw error;
    }
}
/**
 * Obtém um client para transações
 */
async function getClient() {
    return exports.pool.connect();
}
// ===== EVENT HANDLERS =====
async function saveStreamCreated(event) {
    await exports.pool.query("INSERT INTO stream_events (type, stream_id, sender, recipient, token, rate_per_second, duration, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())", [
        "StreamCreated",
        event.streamId,
        event.sender,
        event.recipient,
        event.token,
        event.ratePerSecond,
        event.duration,
    ]);
}
async function saveStreamClaimed(event) {
    await exports.pool.query("INSERT INTO stream_events (type, stream_id, recipient, amount, timestamp) VALUES ($1, $2, $3, $4, NOW())", [
        "StreamClaimed",
        event.streamId,
        event.recipient,
        event.amount
    ]);
}
async function migrateEvents() {
    await exports.pool.query(`
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
async function createStream(stream) {
    await exports.pool.query("INSERT INTO streams (recipient, token, rate, duration, active, sender) VALUES ($1, $2, $3, $4, $5, $6)", [stream.recipient, stream.token, stream.rate, stream.duration, stream.active, stream.sender]);
}
async function getStreamsBySender(sender) {
    const result = await exports.pool.query("SELECT * FROM streams WHERE sender = $1", [sender]);
    return result.rows;
}
async function migrate() {
    await exports.pool.query(`
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
