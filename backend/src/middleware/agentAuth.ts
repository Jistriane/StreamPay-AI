import { Response, NextFunction } from "express";
import { z } from "zod";
import { verifyMessage } from "ethers";
import { AuthRequest } from "./auth";

const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Endereço Ethereum inválido (0x + 40 hex)");

const hexSignatureSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{130}$/, "Assinatura inválida (0x + 65 bytes)");

export const agentPayloadSchema = z.object({
  version: z.literal("1"),
  requestId: z.string().min(8),
  intent: z.string().min(1),
  userAddress: addressSchema,
  network: z.enum(["polygon", "mainnet", "sepolia", "localhost"]),
  chainId: z.number().int(),
  parameters: z.record(z.any()),
  issuedAt: z.number().int(),
  expiresAt: z.number().int(),
});

export const agentRequestSchema = z.object({
  signature: hexSignatureSchema,
  payload: agentPayloadSchema,
});

export type AgentPayload = z.infer<typeof agentPayloadSchema>;

export interface AgentAuthRequest extends AuthRequest {
  agentAuth?: {
    signature: string;
    payload: AgentPayload;
    recoveredAddress: string;
    message: string;
  };
}

function canonicalMessage(payload: AgentPayload): string {
  return `StreamPay Authorization\n\n${JSON.stringify(payload)}`;
}

/**
 * Valida assinatura do usuário para execução via agente.
 * Requer que o usuário já esteja autenticado via JWT (AuthRequest.user).
 */
export function authenticateAgentSignature(
  req: AgentAuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated", code: "NOT_AUTHENTICATED" });
  }

  const parsed = agentRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body", code: "INVALID_BODY", issues: parsed.error.issues });
  }

  const { signature, payload } = parsed.data;

  const now = Date.now();
  if (now > payload.expiresAt) {
    return res.status(400).json({ error: "Signature request expired", code: "SIGNATURE_EXPIRED" });
  }

  if (req.user.address.toLowerCase() !== payload.userAddress.toLowerCase()) {
    return res.status(403).json({ error: "Token/user mismatch", code: "USER_MISMATCH" });
  }

  const message = canonicalMessage(payload);
  const recovered = verifyMessage(message, signature);
  if (recovered.toLowerCase() !== payload.userAddress.toLowerCase()) {
    return res.status(401).json({ error: "Invalid signature", code: "INVALID_SIGNATURE" });
  }

  req.agentAuth = {
    signature,
    payload,
    recoveredAddress: recovered,
    message,
  };

  return next();
}

