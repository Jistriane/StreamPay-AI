import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { APIError } from "./errorHandler";

/**
 * Middleware para validação de request body, params, query
 */
export function validateRequest(schema: {
    body?: ZodSchema;
    params?: ZodSchema;
    query?: ZodSchema;
}) {
    return (req: Request, res: Response, next: NextFunction) => {
        const errors: any = {};

        // Validar body
        if (schema.body) {
            const bodyValidation = schema.body.safeParse(req.body);
            if (!bodyValidation.success) {
                errors.body = bodyValidation.error.flatten();
            } else {
                req.body = bodyValidation.data;
            }
        }

        // Validar params
        if (schema.params) {
            const paramsValidation = schema.params.safeParse(req.params);
            if (!paramsValidation.success) {
                errors.params = paramsValidation.error.flatten();
            } else {
                req.params = paramsValidation.data;
            }
        }

        // Validar query
        if (schema.query) {
            const queryValidation = schema.query.safeParse(req.query);
            if (!queryValidation.success) {
                errors.query = queryValidation.error.flatten();
            } else {
                req.query = queryValidation.data as any;
            }
        }

        // Se há erros, retornar 400
        if (Object.keys(errors).length > 0) {
            throw new APIError(400, "Validation error", "VALIDATION_ERROR", errors);
        }

        next();
    };
}

// ===== SCHEMAS COMUNS =====

export const addressSchema = z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

export const uint256Schema = z.coerce.bigint().positive("Must be positive");

export const createStreamSchema = {
    body: z.object({
        recipient: addressSchema,
        token: addressSchema,
        amount: z.coerce.bigint().positive(),
        duration: z.coerce.number().positive(),
        ratePerSecond: z.coerce.bigint().positive(),
    }),
};

export const claimStreamSchema = {
    params: z.object({
        streamId: z.coerce.number().nonnegative(),
    }),
};

export const cancelStreamSchema = {
    params: z.object({
        streamId: z.coerce.number().nonnegative(),
    }),
};

export const createPoolSchema = {
    body: z.object({
        token0: addressSchema,
        token1: addressSchema,
        amount0: z.coerce.bigint().positive(),
        amount1: z.coerce.bigint().positive(),
    }),
};

export const loginSchema = {
    body: z.object({
        address: addressSchema,
        message: z.string(),
        signature: z.string(),
    }),
};

export const registerSchema = {
    body: z.object({
        address: addressSchema,
        email: z.string().email().optional(),
        message: z.string(),
        signature: z.string(),
    }),
};

