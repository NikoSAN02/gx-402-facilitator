# GX402 Facilitator - Deployment Guide

## Deploying to Vercel

This guide walks you through deploying your GX402 Facilitator to Vercel from start to finish.

### Prerequisites

Before deploying, ensure you have:

1. **A Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **A GitHub Account** - For Vercel integration
3. **Private Keys Ready** - EVM and/or Solana private keys with gas fees
4. **Git Repository** - Your facilitator code in a Git repository

### Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: GX402 Facilitator"
   ```

2. **Create a GitHub Repository**:
   - Go to GitHub and create a new repository
   - Push your code:
   ```bash
   git remote add origin https://github.com/your-username/your-repository-name.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy via Vercel Dashboard

1. **Log into Vercel** at [vercel.com](https://vercel.com)

2. **Click "New Project"**

3. **Import your Git repository**:
   - Select your GitHub account
   - Find and select your facilitator repository
   - Click "Import"

4. **Configure the project**:
   - **Framework Preset**: Select "Other"
   - **Root Directory**: Leave as `/` (root)
   - **Build Command**: `npm run vercel-build` (defined in package.json)
   - **Output Directory**: Leave empty
   - **Development Command**: Leave empty

5. **Set Environment Variables**:
   Click on "Environment Variables" and add:
   
   | Key | Value |
   |-----|-------|
   | `EVM_PRIVATE_KEY` | Your EVM private key (optional) |
   | `SVM_PRIVATE_KEY` | Your Solana private key (optional) |
   | `SVM_RPC_URL` | Custom Solana RPC URL (optional) |

6. **Click "Deploy"**

### Step 3: Verify Your Deployment

1. **Wait for Build to Complete**: This may take 1-3 minutes

2. **Visit Your Deployment URL**: Vercel will provide a unique URL like:
   `https://your-project-name.vercel.app`

3. **Test the Endpoints**:
   ```bash
   # Health check
   curl https://your-project-name.vercel.app/
   
   # Supported networks
   curl https://your-project-name.vercel.app/supported
   
   # Verify (will return error without proper body, which is expected)
   curl -X POST https://your-project-name.vercel.app/verify
   ```

### Step 4: Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains" section
3. Add your custom domain
4. Update DNS records as instructed

### Alternative: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from Command Line**:
   ```bash
   cd gx402-facilitator
   vercel
   ```

4. **Follow the prompts**:
   - Set up and build the project
   - Add environment variables when prompted
   - Confirm deployment settings

5. **After First Deployment**:
   For subsequent deployments:
   ```bash
   vercel --prod  # For production deployments
   vercel         # For preview deployments
   ```

### Security Best Practices

1. **Never commit private keys** to your repository
2. **Use strong private keys** that have minimal permissions
3. **Monitor your deployment** for unusual activity
4. **Keep dependencies updated** with regular maintenance
5. **Use separate keys** for testing and production environments

### Troubleshooting

#### Common Issues:

**Build Fails:**
- Check that package.json has correct dependencies
- Ensure build commands match what's defined in package.json
- Verify TypeScript compiles correctly locally

**Environment Variables Not Working:**
- Ensure they're set in the Vercel dashboard, not in local .env files
- Check that environment variable names match exactly
- Remember to redeploy after changing environment variables

**API Endpoints Return 404:**
- Verify vercel.json has correct routing configuration
- Check that your index.ts file exports the Express app correctly

**Unsupported Networks:**
- Ensure private keys are properly configured
- Check that required network support is enabled in environment variables

#### Testing Locally:
```bash
# Build the project
npm run build

# Start the server locally (requires .env file)
npm start
```

### Scaling Considerations

For production deployments:
- Monitor transaction costs and gas fees
- Consider rate limiting to prevent abuse
- Set up monitoring and alerting for failed transactions
- Have backup infrastructure ready
- Plan for different traffic patterns

### Updating Your Deployment

1. **Commit your changes** locally:
   ```bash
   git add .
   git commit -m "Update description"
   git push origin main
   ```

2. **Vercel will automatically deploy** the changes if connected to GitHub

3. **Or deploy manually**:
   ```bash
   vercel --prod
   ```

Your GX402 Facilitator should now be running and accessible via the deployment URL provided by Vercel!