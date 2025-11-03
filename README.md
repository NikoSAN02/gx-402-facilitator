# GX402 Facilitator

GX402 Facilitator is an independent implementation of the x402 payment protocol facilitator service. It enables gasless, programmatic payments for web resources using blockchain technology. The facilitator acts as a trusted intermediary that verifies and settles payments on behalf of resource servers.

## Features

- **Multi-chain Support**: Supports EVM networks (Base, Base Sepolia) and Solana networks (Solana Devnet)
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
- `PORT`: (Optional) Port number (defaults to 3000)

> **Important**: Keep your private keys secure. Never commit them to version control.

## Security Considerations

- **Private Key Security**: Store private keys securely using environment variables
- **Rate Limiting**: Implement rate limiting in production to prevent abuse
- **Monitoring**: Monitor transaction failures and unusual patterns
- **Gas Management**: Monitor gas fees and implement appropriate caps
- **Transaction Validation**: Thoroughly validate all transactions before execution

## Usage with Resource Servers

To use this facilitator with your resource servers, configure the payment middleware to point to your deployed facilitator:

```typescript
app.use(paymentMiddleware(
  "0xYourAddress",
  { "/api/resource": "$0.01" },
  {
    url: "https://your-deployed-facilitator.vercel.app"  // Your deployed facilitator URL
  }
));
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