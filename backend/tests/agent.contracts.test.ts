import request from "supertest";
import jwt from "jsonwebtoken";
import { Wallet } from "ethers";

// Important: must be set before importing the app (server reads env during initialization).
process.env.NODE_ENV = "test";
process.env.NETWORK = "ethereum";

import app from "../src/server";

function buildJwt(address: string) {
  const secret = process.env.JWT_SECRET || "dev-secret-key";
  return jwt.sign(
    {
      id: address,
      address,
      email: `${address}@streampay.local`,
      role: "user",
    },
    secret,
    { expiresIn: "1h" }
  );
}

describe("Agent Contracts Route", () => {
  it("rejeita sem JWT", async () => {
    const res = await request(app).post("/api/agent/execute-contract").send({});
    expect(res.status).toBe(401);
  });

  it("rejeita assinatura inválida", async () => {
    const wallet = Wallet.createRandom();
    const token = buildJwt(wallet.address);

    const payload = {
      version: "1",
      requestId: "req_test_12345678",
      intent: "CREATE_STREAM",
      userAddress: wallet.address,
      network: "ethereum",
      chainId: 1,
      parameters: {
        recipient: wallet.address,
        token: "MNEE",
        amount: 1,
        durationSeconds: 60,
      },
      issuedAt: Date.now(),
      expiresAt: Date.now() + 60_000,
    };

    const res = await request(app)
      .post("/api/agent/execute-contract")
      .set("Authorization", `Bearer ${token}`)
      .send({
        payload,
        signature: "0x" + "00".repeat(65),
      });

    expect([400, 401, 500]).toContain(res.status);
  });

  it("retorna txRequests para CREATE_STREAM com assinatura válida", async () => {
    const wallet = Wallet.createRandom();
    const token = buildJwt(wallet.address);

    const payload = {
      version: "1",
      requestId: "req_test_12345678",
      intent: "CREATE_STREAM",
      userAddress: wallet.address,
      network: "ethereum",
      chainId: 1,
      parameters: {
        recipient: "0x1234567890123456789012345678901234567890",
        token: "MNEE",
        amount: 1,
        durationSeconds: 60,
      },
      issuedAt: Date.now(),
      expiresAt: Date.now() + 60_000,
    };

    const message = `StreamPay Authorization\n\n${JSON.stringify(payload)}`;
    const signature = await wallet.signMessage(message);

    const res = await request(app)
      .post("/api/agent/execute-contract")
      .set("Authorization", `Bearer ${token}`)
      .send({ payload, signature });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.txRequests)).toBe(true);
    expect(res.body.txRequests.length).toBe(2); // approve + createStream

    const [approveTx, createTx] = res.body.txRequests;
    expect(approveTx.label).toMatch(/Aprovar/i);
    expect(createTx.label).toMatch(/Criar/i);
    expect(approveTx.tx.to).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(createTx.tx.to).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(typeof approveTx.tx.data).toBe("string");
    expect(typeof createTx.tx.data).toBe("string");
  });
});

