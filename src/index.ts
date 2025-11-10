/* eslint-env node */
import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import { verify, settle } from 'x402/facilitator';
import {
  PaymentRequirementsSchema,
  type PaymentRequirements,
  type PaymentPayload,
  PaymentPayloadSchema,
  createConnectedClient,
  createSigner,
  SupportedEVMNetworks,
  SupportedSVMNetworks,
  Signer,
  ConnectedClient,
  SupportedPaymentKind,
  isSvmSignerWallet,
  type X402Config,
  Network,
} from 'x402/types';
import { createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Load environment variables
config();

const app = express();
app.use(express.json());

// Get environment variables
const EVM_PRIVATE_KEY = process.env.EVM_PRIVATE_KEY || '';
const SVM_PRIVATE_KEY = process.env.SVM_PRIVATE_KEY || '';
const SVM_RPC_URL = process.env.SVM_RPC_URL || '';

// Custom network configurations from environment variables
const CUSTOM_EVM_RPC_URL = process.env.CUSTOM_EVM_RPC_URL || '';
const CUSTOM_EVM_CHAIN_ID = process.env.CUSTOM_EVM_CHAIN_ID ? parseInt(process.env.CUSTOM_EVM_CHAIN_ID, 10) : 0;
const CUSTOM_USDC_ADDRESS = process.env.CUSTOM_USDC_ADDRESS || '';
const CUSTOM_TOKEN_NAME = process.env.CUSTOM_TOKEN_NAME || 'USD Coin';
const CUSTOM_TOKEN_VERSION = process.env.CUSTOM_TOKEN_VERSION || '2';

// Create X402 config with custom RPC URL if provided
const x402Config: X402Config | undefined = SVM_RPC_URL
  ? { svmConfig: { rpcUrl: SVM_RPC_URL } }
  : undefined;

interface VerifyRequest {
  paymentPayload: PaymentPayload;
  paymentRequirements: PaymentRequirements;
}

interface SettleRequest {
  paymentPayload: PaymentPayload;
  paymentRequirements: PaymentRequirements;
}

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'GX402 Facilitator Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      verify: 'POST /verify',
      settle: 'POST /settle',
      supported: 'GET /supported'
    }
  });
});

// Verify endpoint
app.post('/verify', async (req: Request, res: Response) => {
  try {
    if (!EVM_PRIVATE_KEY && !SVM_PRIVATE_KEY) {
      return res.status(500).json({ 
        error: 'Server not properly configured - missing private keys' 
      });
    }

    const body: VerifyRequest = req.body;
    const paymentRequirements = PaymentRequirementsSchema.parse(body.paymentRequirements);
    const paymentPayload = PaymentPayloadSchema.parse(body.paymentPayload);

    // Use the correct client/signer based on the requested network
    let client: Signer | ConnectedClient;
    if (SupportedEVMNetworks.includes(paymentRequirements.network)) {
      if (!EVM_PRIVATE_KEY) {
        res.status(400).json({ error: 'EVM network not supported - no private key configured' });
        return;
      }
      client = createConnectedClient(paymentRequirements.network);
    } else if (SupportedSVMNetworks.includes(paymentRequirements.network)) {
      if (!SVM_PRIVATE_KEY) {
        res.status(400).json({ error: 'SVM network not supported - no private key configured' });
        return;
      }
      client = await createSigner(paymentRequirements.network, SVM_PRIVATE_KEY);
    } else if (CUSTOM_EVM_CHAIN_ID > 0 && CUSTOM_EVM_RPC_URL && CUSTOM_USDC_ADDRESS) {
      // Handle custom EVM network
      if (!EVM_PRIVATE_KEY) {
        res.status(400).json({ error: 'Custom EVM network not supported - no private key configured' });
        return;
      }
      // Create a connected client for the custom network using createConnectedClient
      const formattedEvmPrivateKey = EVM_PRIVATE_KEY.startsWith('0x') ? EVM_PRIVATE_KEY : `0x${EVM_PRIVATE_KEY}`;
      client = await createSigner(`custom-${CUSTOM_EVM_CHAIN_ID}` as any, formattedEvmPrivateKey);
    } else {
      res.status(400).json({ error: 'Invalid network' });
      return;
    }

    // For custom tokens, the EIP-712 domain parameters are typically included in payment requirements
    // The x402 library should extract these from the payment requirements extra field
    // If the library supports network-specific configurations, it would handle them internally
    // based on the network identifier and extra parameters in payment requirements

    // Verify the payment
    const valid = await verify(client, paymentPayload, paymentRequirements, x402Config);
    res.json(valid);
    return; // Explicit return to satisfy TypeScript
  } catch (error) {
    console.error('Verification error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Invalid request' 
    });
    return; // Explicit return to satisfy TypeScript
  }
});

// Settle endpoint
app.post('/settle', async (req: Request, res: Response) => {
  try {
    if (!EVM_PRIVATE_KEY && !SVM_PRIVATE_KEY) {
      return res.status(500).json({ 
        error: 'Server not properly configured - missing private keys' 
      });
    }

    const body: SettleRequest = req.body;
    const paymentRequirements = PaymentRequirementsSchema.parse(body.paymentRequirements);
    const paymentPayload = PaymentPayloadSchema.parse(body.paymentPayload);

    // Use the correct private key based on the requested network
    let signer: Signer;
    if (SupportedEVMNetworks.includes(paymentRequirements.network)) {
      if (!EVM_PRIVATE_KEY) {
        res.status(400).json({ error: 'EVM network not supported - no private key configured' });
        return;
      }
      // Ensure EVM private key has '0x' prefix
      const formattedEvmPrivateKey = EVM_PRIVATE_KEY.startsWith('0x') ? EVM_PRIVATE_KEY : `0x${EVM_PRIVATE_KEY}`;
      signer = await createSigner(paymentRequirements.network, formattedEvmPrivateKey);
    } else if (SupportedSVMNetworks.includes(paymentRequirements.network)) {
      if (!SVM_PRIVATE_KEY) {
        res.status(400).json({ error: 'SVM network not supported - no private key configured' });
        return;
      }
      signer = await createSigner(paymentRequirements.network, SVM_PRIVATE_KEY);
    } else if (CUSTOM_EVM_CHAIN_ID > 0 && CUSTOM_EVM_RPC_URL && CUSTOM_USDC_ADDRESS) {
      // Handle custom EVM network
      if (!EVM_PRIVATE_KEY) {
        res.status(400).json({ error: 'Custom EVM network not supported - no private key configured' });
        return;
      }
      // Create a signer for the custom network
      const formattedEvmPrivateKey = EVM_PRIVATE_KEY.startsWith('0x') ? EVM_PRIVATE_KEY : `0x${EVM_PRIVATE_KEY}`;
      signer = await createSigner(`custom-${CUSTOM_EVM_CHAIN_ID}` as any, formattedEvmPrivateKey);
    } else {
      res.status(400).json({ error: 'Invalid network' });
      return;
    }

    // For custom tokens, the EIP-712 domain parameters are typically included in payment requirements
    // The x402 library should extract these from the payment requirements extra field
    // If the library supports network-specific configurations, it would handle them internally
    // based on the network identifier and extra parameters in payment requirements

    // Settle the payment
    const response = await settle(signer, paymentPayload, paymentRequirements, x402Config);
    res.json(response);
    return; // Explicit return to satisfy TypeScript
  } catch (error) {
    console.error('Settlement error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Invalid request' 
    });
    return; // Explicit return to satisfy TypeScript
  }
});

// Supported networks endpoint
app.get('/supported', async (req: Request, res: Response) => {
  let kinds: SupportedPaymentKind[] = [];

  // EVM networks (built-in)
  if (EVM_PRIVATE_KEY) {
    kinds.push({
      x402Version: 1,
      scheme: 'exact',
      network: 'base-sepolia',
    });
    kinds.push({
      x402Version: 1,
      scheme: 'exact',
      network: 'base',
    });
  }

  // Note: Custom networks are supported in the implementation but may not appear in /supported
  // because they're not part of the standard Network enum

  // SVM networks
  if (SVM_PRIVATE_KEY) {
    // Create a signer to get the fee payer address
    try {
      const signer = await createSigner('solana-devnet', SVM_PRIVATE_KEY);
      const feePayer = isSvmSignerWallet(signer) ? signer.address : undefined;

      kinds.push({
        x402Version: 1,
        scheme: 'exact',
        network: 'solana-devnet',
        extra: {
          feePayer,
        },
      });
    } catch (error) {
      console.error('Error creating SVM signer:', error);
    }
  }

  res.json({
    kinds,
  });
});

// Handle 404 for undefined routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Get port from environment or default to 3000
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'vercel') {
  app.listen(PORT, () => {
    console.log(`GX402 Facilitator server is running on port ${PORT}`);
  });
}

export default app;