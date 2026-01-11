import { ContractService } from "../services/contract-service";

describe("ContractService", () => {
  it("gera payload e messageToSign consistentes (CREATE_STREAM)", () => {
    const svc = new ContractService({
      backendUrl: "http://localhost:3001",
      userAddress: "0x1234567890123456789012345678901234567890",
      network: "polygon",
    });

    const req = svc.createStream({
      recipient: "0x1234567890123456789012345678901234567890",
      token: "USDC",
      amount: 1,
      durationSeconds: 60,
    });

    expect(req.pendingSignature).toBe(true);
    expect(req.payload.intent).toBe("CREATE_STREAM");
    expect(req.payload.userAddress).toBe("0x1234567890123456789012345678901234567890");
    expect(req.payload.network).toBe("polygon");
    expect(req.payload.chainId).toBe(137);
    expect(req.payload.parameters.recipient).toBe("0x1234567890123456789012345678901234567890");
    expect(req.payload.parameters.token).toBe("USDC");

    // A mensagem deve conter o payload JSON exato
    expect(req.messageToSign).toContain("StreamPay Authorization");
    expect(req.messageToSign).toContain(JSON.stringify(req.payload));
  });
});

