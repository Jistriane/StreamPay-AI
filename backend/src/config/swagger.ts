/**
 * Swagger/OpenAPI Configuration
 * Documentação interativa da API StreamPay
 * 
 * Acesso: http://localhost:3001/api-docs
 */

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "StreamPay AI API",
      version: "1.0.0",
      description: `
        API para StreamPay AI - Plataforma de pagamento em streaming com AI-powered swaps e hedge de volatilidade.
        
        ## Recursos
        - **Streams**: Criar e gerenciar payment streams
        - **Pools**: Gerenciar pools de liquidez
        - **2FA**: Autenticação de dois fatores com TOTP
        - **Auth**: Autenticação JWT com refresh tokens
        
        ## Autenticação
        A maioria dos endpoints requer autenticação via JWT token no header:
        \`\`\`
        Authorization: Bearer <token>
        \`\`\`
      `,
      contact: {
        name: "StreamPay Team",
        email: "support@streampay.ai",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
      {
        url: "https://api.streampay.ai",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "string",
              example: "Invalid request",
            },
            code: {
              type: "string",
              example: "INVALID_REQUEST",
            },
          },
        },
        Stream: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            sender: {
              type: "string",
              example: "0x1234567890123456789012345678901234567890",
            },
            recipient: {
              type: "string",
              example: "0x0987654321098765432109876543210987654321",
            },
            token: {
              type: "string",
              example: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
            },
            deposit: {
              type: "string",
              example: "1000000000000000000",
            },
            rate_per_second: {
              type: "string",
              example: "11574074074074",
            },
            duration: {
              type: "integer",
              example: 86400,
            },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "active", "paused", "cancelled"],
              example: "active",
            },
            tx_hash: {
              type: "string",
              example: "0xabc123...",
            },
            on_chain_id: {
              type: "string",
              example: "42",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Pool: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "USDC-MNEE Pool",
            },
            token0: {
              type: "string",
              example: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
            },
            token1: {
              type: "string",
              example: "0x...",
            },
            fee: {
              type: "integer",
              example: 3000,
            },
            liquidity: {
              type: "string",
              example: "1000000000000000000000",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./src/routes/*.ts", // Documentação inline nos arquivos de rotas
    "./src/server.ts",
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export function setupSwagger(app: Express): void {
  // Swagger UI
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // JSON spec
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log("[Swagger] API docs available at http://localhost:3001/api-docs");
}
