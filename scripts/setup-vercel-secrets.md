# Vercel Deployment Setup

To enable automatic deployment to Vercel, you need to add these secrets to your GitHub repository:

## Required GitHub Secrets

1. **VERCEL_TOKEN**
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Create a new token
   - Add it as `VERCEL_TOKEN` in GitHub Secrets

2. **VERCEL_ORG_ID**
   - Run: `npx vercel link` in your project
   - Or find it in `.vercel/project.json` after linking
   - Add it as `VERCEL_ORG_ID` in GitHub Secrets

3. **VERCEL_PROJECT_ID**
   - Run: `npx vercel link` in your project
   - Or find it in `.vercel/project.json` after linking
   - Add it as `VERCEL_PROJECT_ID` in GitHub Secrets

## How to Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact names above

## Deployment Behavior

- **Automatic**: Deploys only when CI passes AND there are backend/core changes
- **Manual**: Use the "Manual Deploy Backend to Vercel" workflow for forced deployments
- **Skip**: No deployment if only frontend or documentation changes

## Testing the Setup

1. Make a change to `backend/` or `packages/core/`
2. Push to `main` branch
3. Wait for CI to pass
4. Check the "Deploy Backend to Vercel" workflow
5. Verify deployment on Vercel dashboard
