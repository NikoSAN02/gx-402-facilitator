# GX402 Facilitator Integration Guide

This guide explains how to integrate the GX402 Facilitator into your own applications and services.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Integration Steps](#integration-steps)
- [Client-Side Implementation](#client-side-implementation)
- [Server-Side Implementation](#server-side-implementation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Overview

The GX402 Facilitator is a service that handles x402 protocol payments, enabling you to monetize your APIs, content, and services with blockchain payments without requiring users to hold gas tokens. This service acts as a trusted intermediary that verifies and settles payments on your behalf.

## Prerequisites

Before integrating the GX402 Facilitator into your application, you'll need:

1. **A GX402 Facilitator Instance**: Either deploy your own or use a shared service
2. **Blockchain Address**: To receive payments (EVM or Solana address)
3. **Understanding of x402 Protocol**: Basic knowledge of how x402 works
4. **For Custom Networks**: If using custom EVM networks, ensure your facilitator is configured with the appropriate RPC URL, chain ID, and token contract address

## Integration Steps

### Step 1: Deploy or Access a Facilitator

You have two options:

#### Option A: Deploy Your Own Facilitator
1. Clone the repository: `git clone <facilitator-repo-url>`
2. Deploy to Vercel or your preferred hosting platform
3. Configure environment variables with your private keys

#### Option B: Use a Shared Facilitator
1. Obtain access to a running facilitator instance
2. Ensure it supports your required networks (EVM/Solana)
3. Confirm the service is reliable and secure

### Step 2: Configure Your Resource Server

Update your server to use x402 payment middleware:

```javascript
// Install required dependencies
npm install x402

// Configure payment middleware
import { paymentMiddleware } from 'x402/server';

app.use(paymentMiddleware(
  "0xYourReceivingAddress",  // Your address to receive payments
  { 
    "/api/premium": "$0.01",      // Price for premium content
    "/api/data": "$0.05"          // Price for data access
  },
  {
    url: "https://your-facilitator-url.com"  // URL of your facilitator
  }
));
```

### Step 3: Protect Your Endpoints

The middleware will automatically handle payment requirements. When users access protected endpoints without payment, they'll receive a 402 Payment Required response with payment instructions.

## Client-Side Implementation

### Making Payment Requests

When a client encounters a 402 Payment Required response, they need to make a payment:

```javascript
async function accessPaidContent() {
  try {
    // Initial request to protected resource
    const initialResponse = await fetch('https://your-server.com/api/premium', {
      headers: {
        'Accept': 'application/x402'
      }
    });

    if (initialResponse.status === 402) {
      // Extract payment requirements from the response
      const paymentData = await initialResponse.json();
      
      // Process payment using x402 client library
      const { processPayment } = require('x402/client');
      const paymentResult = await processPayment(paymentData);
      
      if (paymentResult.success) {
        // Retry original request with payment credentials
        const finalResponse = await fetch('https://your-server.com/api/premium', {
          headers: {
            'Authorization': `X402 ${paymentResult.credentials}`
          }
        });
        
        return await finalResponse.json();
      } else {
        throw new Error('Payment failed');
      }
    } else {
      // Resource was accessible without payment
      return await initialResponse.json();
    }
  } catch (error) {
    console.error('Error accessing paid content:', error);
    throw error;
  }
}
```

### Wallet Integration

For Solana-based payments, integrate with wallets like Phantom:

```javascript
// Example with Phantom wallet
async function connectSolanaWallet() {
  if (window.phantom && window.phantom.solana) {
    try {
      const response = await window.phantom.solana.connect();
      const publicKey = response.publicKey.toString();
      return publicKey;
    } catch (error) {
      console.error('Phantom connection failed:', error);
      throw error;
    }
  } else {
    throw new Error('Phantom wallet not found');
  }
}

// Create Solana payment
async function createSolanaPayment(requirements) {
  // Implementation to create and sign Solana transaction
  // This would use @solana/web3.js and user's wallet
}
```

## Server-Side Implementation

### Setting Up Price Points

Configure different price points for your API endpoints:

```javascript
// Example: Multiple pricing tiers
const pricingConfig = {
  // Free tier
  "/api/public": "free",
  
  // Paid tiers
  "/api/basic": "$0.01",      // 1 cent
  "/api/premium": "$0.05",    // 5 cents
  "/api/pro": "$0.10",        // 10 cents
  "/api/enterprise": "$0.50"  // 50 cents
};

app.use(paymentMiddleware(
  process.env.RECEIVING_ADDRESS,  // Your receiving address
  pricingConfig,
  {
    url: process.env.FACILITATOR_URL  // Your facilitator URL
  }
));
```

### Content Protection

Ensure only paid users can access protected content:

```javascript
// Protected route - only accessible after payment
app.get('/api/premium', (req, res) => {
  // This route is only reached after successful payment verification
  res.json({
    content: "Premium content accessible only to paying users",
    timestamp: new Date().toISOString()
  });
});

// Endpoint to check payment status
app.get('/api/payment-status', (req, res) => {
  // This will only be accessible if the request contains valid payment credentials
  res.json({
    status: "Payment verified",
    access: "full",
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  });
});
```

### Error Handling

Handle payment-related errors gracefully:

```javascript
// Global error handler for payment-related issues
app.use((err, req, res, next) => {
  if (err.type === 'payment_required') {
    res.status(402).json({
      error: 'Payment required',
      code: 'PAYMENT_REQUIRED',
      details: err.details
    });
  } else if (err.type === 'payment_verification_failed') {
    res.status(400).json({
      error: 'Payment verification failed',
      code: 'PAYMENT_VERIFICATION_FAILED',
      details: err.details
    });
  } else {
    // Handle other errors
    next(err);
  }
});
```

## Testing

### Local Testing Setup

1. **Start local facilitator**:
   ```bash
   npm run dev
   ```

2. **Configure local server** to use `http://localhost:3000` as the facilitator URL

3. **Use test networks**:
   - Base Sepolia for EVM testing
   - Solana Devnet for Solana testing

### Test Cases

```javascript
// Test accessing protected resource without payment
test('should return 402 for protected resource', async () => {
  const response = await fetch('http://localhost:8080/api/premium');
  expect(response.status).toBe(402);
});

// Test successful payment flow
test('should access resource after successful payment', async () => {
  // First request should return 402 with payment requirements
  const initialResponse = await fetch('http://localhost:8080/api/premium', {
    headers: { 'Accept': 'application/x402' }
  });
  
  expect(initialResponse.status).toBe(402);
  const paymentRequirements = await initialResponse.json();
  
  // Process payment using client-side code
  // Then retry with payment credentials
  
  const finalResponse = await fetch('http://localhost:8080/api/premium', {
    headers: { 'Authorization': `X402 ${paymentCredentials}` }
  });
  
  expect(finalResponse.status).toBe(200);
});
```

### Network-Specific Testing

Test with different blockchain networks:  
- **EVM Networks**: Base, Base Sepolia - use ETH for gas fees
- **Solana Networks**: Solana Devnet - use SOL for gas fees

## Troubleshooting

### Common Issues

#### 1. "Invalid Private Key" Error
- **Cause**: Private key format issues
- **Solution**: Ensure EVM keys start with "0x", Solana keys are in Base58 format

#### 2. 402 Responses Persisting
- **Cause**: Incorrect payment credentials or expired payments  
- **Solution**: Check payment signature validity and expiration times

#### 3. Network Connectivity Issues
- **Cause**: RPC endpoint problems
- **Solution**: Verify RPC URLs and network connectivity

#### 4. Insufficient Gas Fees
- **Cause**: Wallet has insufficient funds for gas
- **Solution**: Add more ETH/SOL to facilitator wallets

### Debugging Tips

1. **Enable logging** in your application to see the full payment flow
2. **Check facilitator logs** for specific error messages
3. **Validate payment payloads** before sending to facilitator
4. **Verify network configurations** match between client and facilitator

### Monitoring

For production deployments, monitor:
- Payment success/failure rates
- Response times
- Error patterns
- Wallet balances for gas fees

## Security Best Practices

1. **Never expose private keys** in client-side code
2. **Use HTTPS** for all communications with the facilitator
3. **Validate responses** from the facilitator service
4. **Implement rate limiting** to prevent abuse
5. **Monitor transactions** for unusual patterns
6. **Secure your receiving addresses** and keep backups

## Deployment Considerations

### Production Environment

- Use a secure, reliable hosting platform
- Implement proper monitoring and alerting
- Ensure adequate funding for gas fees
- Plan for scaling based on usage

### Maintenance

- Monitor transaction fees and adjust pricing if necessary
- Keep dependencies updated
- Review security regularly
- Plan for network upgrades and changes

## Support

For integration support:
- Check the [API Documentation](API.md)
- Review the [README](README.md)
- Open an issue in the repository if you encounter problems
- Join our community for discussions and support

## Next Steps

1. Deploy your facilitator instance
2. Integrate payment middleware into your server
3. Test the complete payment flow
4. Deploy to production
5. Monitor and optimize based on usage