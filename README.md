# GX402 Facilitator

GX402 Facilitator is an independent implementation of the x402 payment protocol facilitator service. It enables gasless, programmatic payments for web resources using blockchain technology. The facilitator acts as a trusted intermediary that verifies and settles payments on behalf of resource servers.

## Features

- **Multi-chain Support**: Supports EVM networks (Base, Base Sepolia) and Solana networks (Solana Devnet)
- **Custom Network Support**: Add support for any EVM network with custom RPC configuration
- **Gasless Transactions**: Clients can make payments without holding gas tokens
- **Easy Integration**: Simple API endpoints for verification and settlement
- **Production Ready**: Built for deployment on Vercel with proper error handling
- **Secure**: Implements proper validation and security measures

## How It Works

The x402 protocol enables a three-party payment system:
- **Resource Server**: Provides content/resources that require payment
- **Client**: Makes payments for resources
- **Facilitator**: Validates and settles payments on behalf of resource servers

The protocol uses the `402 Payment Required` HTTP status code and defines standard request/response formats for payment processing.

## API Endpoints

### GET /
Health check endpoint to verify the server is running.

**Response:**
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
Returns information about supported payment networks and schemes.

**Response:**
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
Verifies a payment payload against the required payment details.

**Request Body:**
```json
{
  "paymentPayload": {
    "x402Version": 1,
    "scheme": "exact",
    "network": "base-sepolia",
    "payload": { ... }
  },
  "paymentRequirements": { ... }
}
```

**Response:**
```json
{
  "isValid": true,
  "invalidReason": null,
  "payer": "0x..."
}
```

### POST /settle
Settles a payment by executing the transaction.

**Request Body:**
```json
{
  "paymentPayload": {
    "x402Version": 1,
    "scheme": "exact",
    "network": "base-sepolia",
    "payload": { ... }
  },
  "paymentRequirements": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "errorReason": null,
  "payer": "0x...",
  "transaction": "0x...",
  "network": "base-sepolia"
}
```

## Prerequisites

Before deploying, you'll need:

1. **EVM Private Key** (for Base networks): A private key with ETH for gas fees
2. **Solana Private Key** (for Solana networks): A private key with SOL for gas fees
3. **Vercel Account**: For deployment
4. **Node.js**: Version 18+ for local development

## Installation & Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd gx402-facilitator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment variables:**
   Create a `.env` file in the root directory:
   ```env
   # EVM (Base networks) - private key with ETH for gas fees
   EVM_PRIVATE_KEY=0xYourPrivateKey

   # Solana networks - private key with SOL for gas fees
   SVM_PRIVATE_KEY=base58EncodedSolanaPrivateKey

   # Optional custom RPC for Solana
   SVM_RPC_URL=https://api.devnet.solana.com

   # Server port (defaults to 3000)
   PORT=3000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Deployment to Vercel

### Option 1: One-Click Deploy

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/gx402-facilitator)

### Option 2: Manual Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel dashboard:**
   Go to your project settings in the Vercel dashboard and add the environment variables from your `.env` file.

## Environment Variables

- `EVM_PRIVATE_KEY`: (Optional) Private key for EVM networks (Base) with gas fees
- `SVM_PRIVATE_KEY`: (Optional) Private key for Solana networks with gas fees
- `SVM_RPC_URL`: (Optional) Custom RPC URL for Solana network
- `CUSTOM_EVM_RPC_URL`: (Optional) Custom RPC URL for your own EVM network
- `CUSTOM_EVM_CHAIN_ID`: (Optional) Chain ID of your custom EVM network
- `CUSTOM_USDC_ADDRESS`: (Optional) Contract address of USDC or EIP-3009 token on your custom network
- `PORT`: (Optional) Port number (defaults to 3000)

> **Important**: Keep your private keys secure. Never commit them to version control.

## Security Considerations

- **Private Key Security**: Store private keys securely using environment variables
- **Rate Limiting**: Implement rate limiting in production to prevent abuse
- **Monitoring**: Monitor transaction failures and unusual patterns
- **Gas Management**: Monitor gas fees and implement appropriate caps
- **Transaction Validation**: Thoroughly validate all transactions before execution

## Custom Network Support

The GX402 Facilitator supports custom EVM networks through environment configuration. This allows you to:

- Support any EVM-compatible blockchain
- Use your own EIP-3009 compatible tokens
- Operate on private or test networks

### Configuration

To add support for a custom network and token, configure these environment variables:

```env
# Your private key with gas tokens for the custom network
EVM_PRIVATE_KEY=0xYourPrivateKey

# Custom network details
CUSTOM_EVM_RPC_URL=https://your-custom-rpc-endpoint.com
CUSTOM_EVM_CHAIN_ID=12345
CUSTOM_USDC_ADDRESS=0xYourEIP3009TokenAddress

# Optional: Custom token parameters (for EIP-3009 tokens)
# CUSTOM_TOKEN_NAME="USD Coin"    # From token's name() function
# CUSTOM_TOKEN_VERSION="2"        # From token's version() function
```

For detailed setup instructions, see [CUSTOM_NETWORK_SETUP.md](CUSTOM_NETWORK_SETUP.md).

## Integration Guide

### For Resource Servers

To integrate the GX402 Facilitator into your resource server, follow these steps:

1. **Deploy your own facilitator instance** (recommended for production) or use a shared instance

2. **Configure payment middleware** to point to your facilitator:

```typescript
import express from 'express';
import { paymentMiddleware } from 'x402/server';

const app = express();

app.use(paymentMiddleware(
  "0xYourAddress",  // Your address to receive payments
  { 
    "/api/premium-content": "$0.01",  // Price per access
    "/api/data-export": "$0.10"
  },
  {
    url: "https://your-deployed-facilitator.vercel.app"  // Your facilitator URL
  }
));

// Your protected routes
app.get('/api/premium-content', (req, res) => {
  res.json({ content: 'Premium content only available to paying users' });
});
```

### For Client Applications

Client applications can make payments to protected resources without holding gas tokens:

```javascript
// Making a payment request to a resource server using x402
async function accessProtectedResource() {
  try {
    // Fetch resource with payment header
    const response = await fetch('https://your-resource-server.com/api/premium-content', {
      headers: {
        'Accept': 'application/x402'
      }
    });

    if (response.status === 402) {  // Payment required
      const paymentReq = await response.json();
      
      // Process payment through the facilitator
      // The client handles creating the appropriate payment payload
    }
    
    return response.json();
  } catch (error) {
    console.error('Payment or resource access failed:', error);
  }
}
```

### Testing Locally

For local testing:

1. Start the facilitator locally: `npm run dev`
2. Set up your resource server to point to `http://localhost:3000`
3. Use test networks (Base Sepolia, Solana Devnet) with test tokens

### Example Integration

Here's a complete example of a resource server using the facilitator:

```typescript
import express from 'express';
import { paymentMiddleware } from 'x402/server';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Configure x402 payment middleware
app.use(paymentMiddleware(
  "0xYourReceivingAddress",  // Address to receive payments
  { 
    "/api/article": "$0.05",     // 5 cents per article
    "/api/api-call": "$0.01"     // 1 cent per API call
  },
  {
    url: process.env.FACILITATOR_URL || "http://localhost:3000"  // Your facilitator URL
  }
));

// Protected routes
app.get('/api/article', (req, res) => {
  res.json({
    title: "Latest Tech News",
    content: "This premium content is protected by x402 payments"
  });
});

app.post('/api/api-call', (req, res) => {
  // Process API call that requires payment
  res.json({ result: "API call processed successfully" });
});

app.listen(8080, () => {
  console.log('Resource server running on port 8080');
});
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository.

## Acknowledgments

- Built on the x402 payment protocol
- Uses viem for EVM interactions
- Uses @solana/kit for Solana interactions