
# StreamPay API Documentation

## Overview

The StreamPay API provides RESTful endpoints for integration between frontend, backend, smart contracts, and external providers. It covers registration, streams, history, compliance, monitoring, notifications, and authentication, with security, automation, and test coverage.

## 📋 Smart Contracts (Sepolia Testnet)

**Network**: Sepolia Testnet (Chain ID: 11155111)  
**Deploy Date**: 15/12/2025 06:05:36 UTC

### Contract Addresses

| Contract | Address | Etherscan |
|----------|---------|-----------|
| **StreamPayCore** | `0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C` | [View](https://sepolia.etherscan.io/address/0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C) |
| **LiquidityPool** | `0x896171C52d49Ff2e94300FF9c9B2164aC62F0Edd` | [View](https://sepolia.etherscan.io/address/0x896171C52d49Ff2e94300FF9c9B2164aC62F0Edd) |
| **PoolManager** | `0x0F71393348E7b021E64e7787956fB1e7682AB4A8` | [View](https://sepolia.etherscan.io/address/0x0F71393348E7b021E64e7787956fB1e7682AB4A8) |
| **SwapRouter** | `0x9f3d42feC59d6742CC8dC096265Aa27340C1446F` | [View](https://sepolia.etherscan.io/address/0x9f3d42feC59d6742CC8dC096265Aa27340C1446F) |
| **USDC (Token)** | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | [View](https://sepolia.etherscan.io/token/0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238) |

### Configuration Files

- **Frontend**: `frontend/app/config/contracts.ts`
- **Backend**: `backend/src/config/contracts.ts`
- **Deployment**: `smart-contracts/deployments/sepolia-1765778736884.json`

For full reference, see [CONTRATOS_DEPLOYADOS.md](../CONTRATOS_DEPLOYADOS.md)

---

## Authentication

- JWT for protected routes
- Public and private endpoints
- Login example:

  ```http
  POST /api/auth/login
  {
    "email": "user@email.com",
    "password": "123456"
  }
  ```

  Response:

  ```json
  {
    "token": "..."
  }
  ```

## Main Endpoints


### Create Stream

- `POST /api/streams`
  - Creates a new stream
  - Parameters: recipient, token, rate, duration
  - Authenticated


### List Streams

- `GET /api/streams`
  - Lists active streams
  - Filters: status, recipient, token


### Stream History

- `GET /api/streams?finalized=true`
  - Lists finalized streams


### Stream Details

- `GET /api/streams/:id`
  - Full details of a stream


### Compliance & KYC

- `GET /api/kyc-status`
  - User KYC status
  - Response: status, reason, date


### Monitoring

- `GET /api/monitoring-status`
  - Status of integrated services
  - Response: status, alerts


### User Profile

- `GET /api/user/profile`
  - Get profile

- `PUT /api/user/profile`
  - Update profile
  - Parameters: name, email


### Notifications

- `POST /api/notifications`
  - Send notification (email, webhook)

## Responses and Errors

- Success: HTTP 200/201, JSON body
- Validation error: HTTP 400, message
- Authentication error: HTTP 401
- Permission error: HTTP 403
- Internal error: HTTP 500

## Usage Examples



### Create Stream (Example)

```http
POST /api/streams
Authorization: Bearer <token>
{
  "recipient": "0xabc...",
  "token": "USDC",
  "rate": "50",
  "duration": 100
}
```


### Get History

```http
GET /api/streams?finalized=true
Authorization: Bearer <token>
```


### Get Compliance

```http
GET /api/kyc-status
Authorization: Bearer <token>
```

## Security

- All sensitive routes require JWT
- Data validation on all endpoints
- Operation logs and auditing

## Testing & Coverage

- Automated tests for all endpoints
- Coverage for success, error, null data scenarios
- Reports in `coverage/lcov-report/index.html`

## References

- [OpenAPI](https://swagger.io/specification/)
- [Express](https://expressjs.com/)
- [JWT](https://jwt.io/)

---

For advanced details, see the route and controller files in `backend/src/` or contact the development team.
