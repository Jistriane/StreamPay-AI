import { Request, Response, NextFunction } from "express";

/**
 * Classe de erro customizado para API
 */
export class APIError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = "APIError";
    }
}

/**
 * Wraps async route handlers para capturar erros
 */
export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Middleware central de tratamento de erros
 */
export function errorHandler(
    error: Error | APIError,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    console.error("Error:", {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
    });

    if (error instanceof APIError) {
        res.status(error.statusCode).json({
            error: error.name,
            message: error.message,
            code: error.code,
            details: error.details,
            timestamp: new Date().toISOString(),
        });
        return;
    }

    // Erro desconhecido
    res.status(500).json({
        error: "Internal Server Error",
        message:
            process.env.NODE_ENV === "production"
                ? "An unexpected error occurred"
                : error.message,
        timestamp: new Date().toISOString(),
    });
}
