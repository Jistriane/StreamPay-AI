import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        address: string;
        email?: string;
        role: string;
    };
}

/**
 * Middleware de autenticação JWT
 */
export function authenticateJWT(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                error: "Unauthorized",
                message: "Missing or invalid authorization header",
            });
            return;
        }

        const token = authHeader.substring(7);
        const secret = process.env.JWT_SECRET || "dev-secret-key";

        const decoded = jwt.verify(token, secret) as any;

        req.user = {
            id: decoded.id,
            address: decoded.address,
            email: decoded.email,
            role: decoded.role || "user",
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                error: "Unauthorized",
                message: "Token expired",
            });
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                error: "Unauthorized",
                message: "Invalid token",
            });
        } else {
            res.status(500).json({
                error: "Internal Server Error",
                message: "Authentication failed",
            });
        }
    }
}

/**
 * Middleware para verificar role específica
 */
export function requireRole(...roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                error: "Unauthorized",
                message: "User not authenticated",
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                error: "Forbidden",
                message: `Required role: ${roles.join(" or ")}`,
            });
            return;
        }

        next();
    };
}

/**
 * Gera JWT token
 */
export function generateToken(payload: {
    id: string;
    address: string;
    email?: string;
    role?: string;
}): string {
    const secret = process.env.JWT_SECRET || "dev-secret-key";
    
    // Converte duração para segundos (24h = 86400s)
    const expiresInSeconds = 86400; // 24 horas por padrão
    
    const options: SignOptions = { expiresIn: expiresInSeconds };
    return jwt.sign(payload, secret, options);
}

// Alias para compatibilidade
export const authenticate = authenticateJWT;
