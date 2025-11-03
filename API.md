# GX402 Facilitator API Documentation

## Overview

The GX402 Facilitator provides endpoints for verifying and settling x402 protocol payments. It enables resource servers to delegate payment verification and settlement to a trusted facilitator service.

## Base URL

The base URL depends on your deployment:
- Local: `http://localhost:3000`
- Vercel: `https://your-deployment-name.vercel.app`

## Endpoints

### GET /

**Description**: Health check endpoint to verify the server is running.

**Response**:
```json
{
  "message": "GX402 Facilitator Server",
  "status": "running",
  "version": "1.0.0",
  "endpoints": {
    "verify": "POST /verify",
    "settle": "POST /settle",
    "supported": "GET /supported"
  }
}
```

### GET /supported

**Description**: Returns information about supported payment networks and schemes.

**Response**:
```json
{
  "kinds": [
    {
      "x402Version": 1,
      "scheme": "exact",
      "network": "base-sepolia",
      "extra": {}
    },
    {
      "x402Version": 1,
      "scheme": "exact",
      "network": "solana-devnet",
      "extra": {
        "feePayer": "SolanaAddress"
      }
    }
  ]
}
```

### POST /verify

**Description**: Verifies a payment payload against the required payment details.

**Request Headers**:
- `Content-Type: application/json`

**Request Body**:
```json
{
  "paymentPayload": {
    "x402Version": 1,
    "scheme": "exact",
    "network": "base-sepolia",
    "payload": {
      "signature": "0x...",
      "authorization": {
        "from": "0x...",
        "to": "0x...",
        "value": "1000000",  // Amount in atomic units (6 decimals for USDC)
        "validAfter": "0",
        "validBefore": "1700000000",
        "nonce": "0x..."
      }
    }
  },
  "paymentRequirements": {
    "scheme": "exact",
    "network": "base-sepolia",
    "maxAmountRequired": "1000000",
    "resource": "https://example.com/api/resource",
    "description": "Access to premium content",
    "mimeType": "application/json",
    "payTo": "0x...",
    "maxTimeoutSeconds": 60,
    "asset": "0x...",
    "extra": {
      "name": "USD Coin",
      "version": "2"
    }
  }
}
```

**Response (Success)**:
```json
{
  "isValid": true,
  "invalidReason": null,
  "payer": "0x..."
}
```

**Response (Error)**:
```json
{
  "isValid": false,
  "invalidReason": "insufficient_funds",
  "payer": "0x..."
}
```

### POST /settle

**Description**: Settles a payment by executing the transaction on the blockchain.

**Request Headers**:
- `Content-Type: application/json`

**Request Body**:
```json
{
  "paymentPayload": {
    "x402Version": 1,
    "scheme": "exact",
    "network": "base-sepolia",
    "payload": {
      "signature": "0x...",
      "authorization": {
        "from": "0x...",
        "to": "0x...",
        "value": "1000000",
        "validAfter": "0",
        "validBefore": "1700000000",
        "nonce": "0x..."
      }
    }
  },
  "paymentRequirements": {
    "scheme": "exact",
    "network": "base-sepolia",
    "maxAmountRequired": "1000000",
    "resource": "https://example.com/api/resource",
    "description": "Access to premium content",
    "mimeType": "application/json",
    "payTo": "0x...",
    "maxTimeoutSeconds": 60,
    "asset": "0x...",
    "extra": {
      "name": "USD Coin",
      "version": "2"
    }
  }
}
```

**Response (Success)**:
```json
{
  "success": true,
  "errorReason": null,
  "payer": "0x...",
  "transaction": "0x...",
  "network": "base-sepolia"
}
```

**Response (Error)**:
```json
{
  "success": false,
  "errorReason": "invalid_exact_evm_payload_signature",
  "payer": "0x...",
  "transaction": "",
  "network": "base-sepolia"
}
```

## Error Codes

The facilitator may return the following error codes:

| Code | Description |
|------|-------------|
| `insufficient_funds` | The payer does not have enough funds |
| `invalid_exact_evm_payload_signature` | The EVM signature is invalid |
| `invalid_exact_evm_payload_recipient_mismatch` | The recipient doesn't match payment requirements |
| `invalid_exact_evm_payload_authorization_valid_before` | The authorization has expired |
| `invalid_exact_evm_payload_authorization_valid_after` | The authorization is not yet valid |
| `invalid_exact_evm_payload_authorization_value` | The value in the authorization is incorrect |
| `invalid_network` | The specified network is not supported |
| `invalid_scheme` | The specified scheme is not supported |
| `payment_expired` | The payment has expired |
| `unsupported_scheme` | The scheme is not supported |
| `invalid_x402_version` | The x402 version is not supported |
| `invalid_transaction_state` | The transaction state is invalid |
| `settle_exact_svm_block_height_exceeded` | Solana transaction block height exceeded |
| `settle_exact_svm_transaction_confirmation_timed_out` | Solana transaction confirmation timed out |

## Rate Limiting

This implementation does not include rate limiting by default. For production use, consider implementing rate limiting based on IP address or API keys.

## Security Headers

For production deployments, consider adding security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`