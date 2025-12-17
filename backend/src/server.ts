import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import { pool } from "./db";
import { authenticateJWT, requireRole } from "./middleware/auth";
import { errorHandler, asyncHandler } from "./middleware/errorHandler";
import { validateRequest } from "./middleware/validation";
import { ObservabilityMiddleware } from "./middleware/observability";
import { SecurityMiddleware } from "./middleware/security";
import streamsRouter from "./routes/streams";
import poolsRouter from "./routes/pools";
import authRouter from "./routes/auth";
import twoFARouter from "./routes/2fa";
import etherscanRouter from "./routes/external/etherscan";
import moralisRouter from "./routes/external/moralis";
import infuraRouter from "./routes/external/infura";
import elizaosRouter from "./routes/external/elizaos";
import { setupSwagger } from "./config/swagger";
import { validateEnv, getConfigStatus, validateBlockchainConfig } from "./config/validation";

dotenv.config();

// Validar configuração na inicialização
const config = validateEnv();
validateBlockchainConfig(config);

const app: Express = express();
const PORT = config.PORT;
const ENV = config.NODE_ENV;

// ===== MIDDLEWARE =====

// Initialize observability and security middleware
const observability = new ObservabilityMiddleware();
const security = new SecurityMiddleware();

// Helmet security headers (must be first)
app.use(security.helmet());

// CORS with granular origin validation
app.use(
    security.validateCors({
        allowedOrigins: [
            "http://localhost:3000",
            "http://localhost:3003",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3003",
        ],
        credentials: true,
    })
);

// Global rate limiting (exclude health and metrics)
app.use(security.globalRateLimit());

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Input sanitization
app.use(security.sanitizeInput());

// Request logging with observability
app.use(observability.requestLogger());

// SQL injection protection
app.use(security.preventSQLInjection());

// ===== HEALTH CHECK & METRICS ENDPOINTS =====

// Health check (no rate limit)
app.get("/health", observability.healthCheck());

// Metrics (no rate limit)
app.get("/metrics", observability.metricsEndpoint());

// App info (no rate limit)
app.get("/info", observability.appInfoEndpoint());

// ===== ROUTES =====

// Swagger Documentation
setupSwagger(app);

// Auth rate limiting (stricter - 5 req/15min)
app.use("/api/auth", security.authRateLimit());

// Public routes
app.use("/api/auth", authRouter);

// External API rate limiting (30 req/min)
app.use("/api/etherscan", security.externalAPIRateLimit());
app.use("/api/moralis", security.externalAPIRateLimit());
app.use("/api/infura", security.externalAPIRateLimit());
app.use("/api/elizaos", security.externalAPIRateLimit());

// External API routes (Etherscan, Moralis, Infura, ElizaOS)
app.use("/api", etherscanRouter);
app.use("/api", moralisRouter);
app.use("/api", infuraRouter);
app.use("/api", elizaosRouter);

// Protected routes
app.use("/api/streams", authenticateJWT, streamsRouter);
app.use("/api/pools", authenticateJWT, poolsRouter);
app.use("/api/2fa", twoFARouter); // Partial protected (some routes need auth, some don't)

// ===== 404 HANDLER =====

app.use((req: Request, res: Response) => {
    // Log security event for 404 (potential reconnaissance)
    security.logSecurityEvent(req, "bad_request", "Route not found");
    res.status(404).json({
        error: "Not Found",
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
    });
});

// ===== ERROR HANDLER =====

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // Log error with observability
    observability.errorLogger()(err, req, res, next);
});

// Fallback error handler
app.use(errorHandler);

// ===== SERVER STARTUP =====

// Não inicia o servidor durante os testes
if (process.env.NODE_ENV !== 'test') {
    const server = app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════╗
║      StreamPay AI Backend Started      ║
╠════════════════════════════════════════╣
║ Environment: ${ENV.padEnd(25)} ║
║ Port: ${PORT.toString().padEnd(31)} ║
║ URL: http://localhost:${PORT} ${"".padEnd(14)} ║
║ Database: PostgreSQL (" (".padEnd(19)} ║
╚════════════════════════════════════════╝
    `);
    });

    // ===== GRACEFUL SHUTDOWN =====

    process.on("SIGTERM", async () => {
        console.log("SIGTERM received, shutting down gracefully...");
        server.close(async () => {
            await pool.end();
            console.log("Server closed");
            process.exit(0);
        });
    });

    process.on("SIGINT", async () => {
        console.log("SIGINT received, shutting down gracefully...");
        server.close(async () => {
            await pool.end();
            console.log("Server closed");
            process.exit(0);
        });
    });
}

export default app;
