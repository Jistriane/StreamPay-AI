import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

/**
 * Proxy do frontend para o backend/ElizaOS.
 *
 * - Remove mocks/simulações.
 * - Encaminha a mensagem para `POST ${BACKEND_URL}/api/eliza-message`.
 * - Retorna `resposta` + `data` (quando o agente pedir assinatura).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = String(body?.prompt || "");
    const userAddress = body?.userAddress ? String(body.userAddress) : undefined;
    const authHeader = request.headers.get('authorization') || undefined;
    
    if (!authHeader) {
      console.warn("[API/Eliza] Missing Authorization header in request");
    } else {
      console.log("[API/Eliza] Forwarding request with auth token");
    }

    if (!prompt.trim()) {
      return NextResponse.json({ error: "Prompt é obrigatório" }, { status: 400 });
    }

    // Backend exige userId. Usamos o endereço quando disponível.
    const userId = userAddress || "anonymous";
    const userName = userAddress ? `wallet_${userAddress.slice(2, 8)}` : "anonymous";

    const r = await fetch(`${BACKEND_URL}/api/eliza-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({
        message: prompt,
        userId,
        userName,
        // Também envia explicitamente o token para serviços que não leem headers
        authToken: authHeader?.startsWith('Bearer ')
          ? authHeader.slice('Bearer '.length)
          : undefined,
      }),
    });

    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      return NextResponse.json(
        { error: data?.error || "Failed to query agent (ElizaOS)" },
        { status: 502 }
      );
    }

    const data = await r.json();
    const response = data?.response;

    return NextResponse.json({
      resposta: response?.text || "Sem resposta do agente.",
      data: response?.data,
      action: response?.action,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error processing message" }, { status: 500 });
  }
}
