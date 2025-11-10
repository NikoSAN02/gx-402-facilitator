# GX402 Facilitator Documentation

## Overview

The GX402 Facilitator is an independent implementation of the x402 Payment Protocol that enables applications to accept cryptocurrency payments across multiple blockchain networks (EVM and Solana-based networks). This service acts as an intermediary that verifies and settles payments according to the x402 standard.

## Features

- Supports EVM networks (Base, Base Sepolia)
- Supports Solana networks (Solana Devnet)
- Payment verification and settlement
- HTTP API endpoints for integration
- Environment-based configuration

## API Endpoints

### GET `/`
Health check endpoint to verify the service is running.

Response:
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

### GET `/supported`
Returns a list of supported payment kinds and networks.

Response:
```json
{
  "kinds": [
    {
      "x402Version": 1,
      "scheme": "exact",
      "network": "base-sepolia"
    },
    {
      "x402Version": 1,
      "scheme": "exact",
      "network": "base"
    },
    {
      "x402Version": 1,
      "scheme": "exact",
      "network": "solana-devnet",
      "extra": {
        "feePayer": "Solana public address"
      }
    }
  ]
}
```

### POST `/verify`
Verifies a payment before settlement.

Request Body:
```json
{
  "paymentPayload": {
    // Payment payload data according to x402 specification
  },
  "paymentRequirements": {
    "network": "base-sepolia", 
    // Other payment requirement fields
  }
}
```

Response: Returns verification result

### POST `/settle`
Processes and settles a verified payment.

Request Body:
```json
{
  "paymentPayload": {
    // Payment payload data according to x402 specification
  },
  "paymentRequirements": {
    "network": "base-sepolia",
    // Other payment requirement fields
  }
}
```

Response: Returns settlement result

## Integration Guide

### 1. Setup

You can integrate with the GX402 Facilitator in two ways:

#### Option A: Use the hosted service
If a hosted version is available, configure your application to make HTTP requests to the facilitator endpoints.

#### Option B: Self-host the facilitator
Deploy your own instance of the GX402 Facilitator:

```bash
git clone <repository-url>
cd gx-402-facilitator
npm install
```

### 2. Environment Configuration

Create a `.env` file with the following variables:

```
# EVM (Base networks) - private key with ETH for gas fees
# Required for EVM network support
EVM_PRIVATE_KEY=0xYourEvmPrivateKeyHex

# Solana networks - private key with SOL for gas fees
# Required for Solana network support  
SVM_PRIVATE_KEY=YourSolanaPrivateKeyBase58

# Optional custom RPC for Solana
SVM_RPC_URL=https://api.devnet.solana.com

# Server port (defaults to 3000)
PORT=3000
```

Make sure to fund your wallets with:
- ETH on Base networks (for gas fees)
- SOL on Solana networks (for gas fees)

### 3. Client Integration

To integrate the facilitator into your application:

#### JavaScript/TypeScript Example

```javascript
// Example: Verifying a payment
async function verifyPayment(paymentPayload, paymentRequirements, facilitatorUrl) {
  const response = await fetch(`${facilitatorUrl}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      paymentPayload,
      paymentRequirements
    })
  });

  if (!response.ok) {
    throw new Error('Payment verification failed');
  }

  return await response.json();
}

// Example: Settling a payment
async function settlePayment(paymentPayload, paymentRequirements, facilitatorUrl) {
  const response = await fetch(`${facilitatorUrl}/settle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      paymentPayload,
      paymentRequirements
    })
  });

  if (!response.ok) {
    throw new Error('Payment settlement failed');
  }

  return await response.json();
}

// Example: Getting supported payment types
async function getSupportedPayments(facilitatorUrl) {
  const response = await fetch(`${facilitatorUrl}/supported`);
  return await response.json();
}
```

#### Other Languages

Any programming language that can make HTTP requests can integrate with the facilitator. Just send JSON requests to the appropriate endpoints.

### 4. Payment Flow

The typical x402 payment flow with this facilitator:

1. **Discover Supported Networks**: Call `/supported` to see which payment types are available
2. **Create Payment Requirements**: Based on supported options, create the payment requirements for your specific payment
3. **Verify Payment**: Send payment data to `/verify` endpoint to validate the payment
4. **Settle Payment**: Once verified, send payment data to `/settle` endpoint to complete the transaction

### 5. Error Handling

The facilitator returns appropriate HTTP status codes:
- `200`: Success
- `400`: Bad request (invalid data)
- `404`: Endpoint not found
- `500`: Server error (configuration issues)

Always check HTTP status codes and response bodies for error messages.

### 6. Testing

For testing purposes:
- Use Base Sepolia for EVM testing
- Use Solana Devnet for Solana testing
- Ensure your test wallets have sufficient test tokens

## Security Considerations

- Never expose private keys in client-side code
- Use HTTPS when communicating with the facilitator
- Validate all responses from the facilitator
- Monitor your wallet balances and transaction fees
- Keep your private keys secure and backed up

## Deployment

### Docker (Recommended)
```bash
docker build -t gx402-facilitator .
docker run -p 3000:3000 -e EVM_PRIVATE_KEY=... -e SVM_PRIVATE_KEY=... gx402-facilitator
```

### Direct Node.js
```bash
npm run build
npm start
```

Or for development:
```bash
npm run dev
```

## Troubleshooting

### Common Issues

1. **"Invalid private key" errors**: Ensure your EVM private keys start with "0x" and Solana keys are in Base58 format
2. **Insufficient funds**: Ensure your wallets have enough ETH/SOL for gas fees
3. **Network connectivity**: Verify you can reach the blockchain networks
4. **Rate limiting**: Be aware of RPC rate limits if self-hosting

### Logging

Enable logging to troubleshoot issues:
- Check server console logs
- Monitor wallet transactions
- Verify network connectivity

## Support

For support, please check:
- This documentation
- API responses and error messages
- Blockchain network status
- Your configuration and private keys

## API Reference

### Request Structure

All POST requests expect a JSON body with these properties:
- `paymentPayload`: The payment data as defined by x402 specification
- `paymentRequirements`: The requirements for this specific payment

### Response Structure

Successful responses return 200 status with JSON payload.
Error responses return appropriate status codes with error messages:
```json
{
  "error": "Descriptive error message"
}
```

## Versioning

This facilitator implements x402 protocol version 1. Check the `/supported` endpoint to see which specific networks and features are supported.