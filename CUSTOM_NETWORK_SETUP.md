# Custom Network and Token Setup for x402 Facilitator

This guide explains how to configure the x402 facilitator to support custom EVM networks and EIP-3009 tokens.

## Prerequisites

To run a custom facilitator with support for your own networks and tokens, you need:

1. **Access to an RPC endpoint** for your target network
2. **A wallet with native tokens** for gas sponsorship on your custom network
3. **The EIP-3009 compatible token contract address** on your custom network
4. **Token metadata**: The token's EIP-712 name and version (from the token's `name()` and `version()` functions)

## Network Configuration

Add the following environment variables to your `.env` file to configure support for a custom EVM network:

```bash
# Your private key for the custom network (with native tokens for gas)
EVM_PRIVATE_KEY=0xYourEvmPrivateKeyHere

# Custom network configuration
CUSTOM_EVM_RPC_URL=https://your-custom-network-rpc.com
CUSTOM_EVM_CHAIN_ID=12345  # The chain ID of your custom network
CUSTOM_USDC_ADDRESS=0xYourCustomEIP3009TokenAddress  # The EIP-3009 token address on your network
```

## Custom Token Configuration

To configure custom EIP-3009 token parameters (name and version):

```bash
# Custom token configuration (optional if using standard USDC)
CUSTOM_TOKEN_NAME="USD Coin"    # From the token's name() function
CUSTOM_TOKEN_VERSION="2"        # From the token's version() function
```

## Supported Networks Endpoint

Once configured, your facilitator's `/supported` endpoint will show both the standard networks and indicate support for custom networks:

```json
{
  "kinds": [
    {
      "x402Version": 1,
      "scheme": "exact",
      "network": "base-sepolia"
    }
  ]
}
```

Note: Custom networks may not appear in the supported list if they're not in the standard Network enum, but they will still be functional.

## Custom Tokens

The facilitator supports any EIP-3009 compatible token on your custom network. For proper EIP-712 signature verification, ensure you provide:

- **EIP-712 Name**: The value returned by the token's `name()` function
- **EIP-712 Version**: The value returned by the token's `version()` function

## Verification and Settlement

When making requests to your facilitator:

### For Custom Networks:
- Use the network identifier `"custom-{CHAIN_ID}"` in your payment requirements
- The facilitator will connect to your custom RPC endpoint and handle transactions on your network
- Gas fees will be paid from the wallet associated with your `EVM_PRIVATE_KEY`

### For Custom Tokens:
- Include the token's EIP-712 name and version in the `extra` field of payment requirements
- Example:
```json
{
  "paymentRequirements": {
    "network": "custom-420",  // Your custom network
    "asset": "0xYourCustomTokenAddress",
    "amount": "1000000",  // Amount in smallest units
    "destination": "0xRecipientAddress",
    "x402Version": 1,
    "scheme": "exact",
    "extra": {
      "name": "Your Token Name",
      "version": "1"
    }
  }
}
```

## Example Usage

```typescript
// Example payment requirements for your custom network and token
const paymentRequirements = {
  network: "custom-420",  // Your custom network
  asset: "0xYourCustomTokenAddress",  // Your custom EIP-3009 token
  amount: "1000000",  // Amount in smallest units (e.g., 1 token = 1000000)
  destination: "0xRecipientAddress",
  x402Version: 1,
  scheme: "exact",
  extra: {
    name: "Your Token Name",    // Token's name() function result
    version: "1"               // Token's version() function result
  }
};
```

## Troubleshooting

Common issues and solutions:

1. **"Invalid network" error**: Make sure your `CUSTOM_EVM_CHAIN_ID` matches the actual chain ID of your network
2. **RPC connection issues**: Verify that your RPC endpoint is accessible and properly configured
3. **Insufficient gas**: Ensure your wallet has enough native tokens for gas fees on the custom network
4. **Token verification failures**: Confirm that:
   - Your token implements the EIP-3009 standard with `transferWithAuthorization` function
   - The EIP-712 name and version match the token's `name()` and `version()` functions
   - The token contract address is correct
5. **Signature verification errors**: Check that the token's EIP-712 domain parameters match what's configured in your payment requirements