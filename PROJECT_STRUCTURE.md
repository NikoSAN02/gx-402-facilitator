# GX402 Facilitator - Project Structure

## Overview

This document explains the structure of the GX402 Facilitator project and how each component contributes to the overall functionality.

## Directory Structure

```
gx402-facilitator/
├── src/
│   ├── index.ts          # Main server implementation
│   └── test.ts          # Test utilities (optional)
├── .env.example         # Example environment variables
├── .gitignore           # Git ignore rules
├── Dockerfile           # Containerization instructions
├── API.md              # API documentation
├── PROJECT_STRUCTURE.md # This file
├── README.md           # Main project documentation
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vercel.json         # Vercel deployment configuration
└── node_modules/       # Dependencies (git ignored)
```

## Key Files Explained

### `src/index.ts`
This is the main server file that implements the facilitator functionality:

- **Server Setup**: Uses Express.js to create an HTTP server
- **API Endpoints**: Implements the three required endpoints (`/verify`, `/settle`, `/supported`)
- **Environment Handling**: Reads environment variables for private keys
- **x402 Integration**: Uses the x402 library for verification and settlement
- **Error Handling**: Includes proper error handling and validation
- **Network Support**: Supports both EVM and SVM networks

### `package.json`
- **Dependencies**: Lists all required packages including x402, viem, @solana/kit, and Express
- **Scripts**: Defines commands for development, building, and deployment
- **Metadata**: Project name, version, description, and author information

### `vercel.json`
- **Deployment Configuration**: Configures the Vercel deployment
- **Build Settings**: Specifies the build command and file routing
- **API Routes**: Routes all requests to the main server file

### `tsconfig.json`
- **Compilation Options**: Configures TypeScript compilation
- **Output Settings**: Defines the build output directory
- **Type Checking**: Enables strict type checking

## How the Facilitator Works

### Request Flow

1. **Client Request**: Resource server sends payment verification/settlement request to facilitator
2. **Validation**: The facilitator validates the request structure using Zod schemas
3. **Network Detection**: Determines if the request is for EVM or SVM network
4. **Wallet Creation**: Creates appropriate wallet based on network and private key
5. **x402 Operation**: Calls x402 library functions for verification or settlement
6. **Response**: Returns the result in the required x402 format

### Verification Process
1. Parses payment payload and requirements
2. Validates the signature/authenticity of the payment
3. Checks if the payer has sufficient funds
4. Ensures payment amount matches requirements
5. Returns validation result

### Settlement Process
1. Re-verifies the payment (to ensure it's still valid)
2. Executes the transaction on the blockchain using the facilitator's wallet
3. Waits for transaction confirmation
4. Returns transaction details

## Deployment Specifics

### Vercel Deployment
- Uses the `@vercel/node` builder
- Automatically builds TypeScript code
- Handles environment variables securely
- Provides global CDN distribution

### Environment Variables
- Stored securely in Vercel dashboard
- Never committed to version control
- Required for wallet functionality on various networks

## Security Considerations

- **Private Keys**: Kept in environment variables, never in code
- **Input Validation**: All requests validated using Zod schemas
- **Network Validation**: Only supports configured networks
- **Rate Limiting**: Should be implemented separately for production

## Extensibility Points

The design allows for easy extension:

- **Additional Networks**: Can be added by updating x402 library
- **New Schemes**: Can be implemented by extending x402 protocol
- **Monitoring**: Easy to add logging and metrics
- **Authentication**: Can add API keys or other auth methods