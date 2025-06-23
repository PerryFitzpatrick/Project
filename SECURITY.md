# Security and Secret Management

## ⚠️ IMPORTANT: Secret Management

This project uses sensitive API keys and tokens that must be managed securely. **Never commit secrets to version control.**

## Exposed Secrets (FIXED)

The following secrets were previously exposed and have been revoked:
- **Postmark API Token**: `a9648624-7b85-4864-a9c0-2caf12a9eadf` (REVOKED)
- **Bunny.net Storage API Key**: `07db7c56-22d3-4767-acf11d558392-ddb4-435f` (REVOKED)

## Required Secrets

### 1. Postmark API Token
- **Purpose**: Email sending functionality
- **Used in**: Cloudflare Worker, Go Backend
- **Generate new token**: [Postmark Dashboard](https://account.postmarkapp.com/api_tokens)

### 2. Bunny.net Storage API Key
- **Purpose**: File storage and CDN
- **Used in**: Cloudflare Worker
- **Generate new key**: [Bunny.net Dashboard](https://dash.bunny.net/storage)

## Setting Up Secrets

### For Cloudflare Worker

1. **Set Postmark API Token**:
   ```bash
   cd cloudflare-worker
   npx wrangler secret put POSTMARK_API_TOKEN
   # Enter your new Postmark API token when prompted
   ```

2. **Set Bunny.net Storage API Key**:
   ```bash
   npx wrangler secret put BUNNY_STORAGE_API_KEY
   # Enter your new Bunny.net API key when prompted
   ```

3. **Verify secrets are set**:
   ```bash
   npx wrangler secret list
   ```

### For Go Backend (Local Development)

1. **Create `.env` file** (never commit this):
   ```bash
   cd backend
   echo "POSTMARK_API_TOKEN=your_new_postmark_token_here" > .env
   ```

2. **Load environment variables** in your Go application:
   ```go
   // Add to your main.go or use a package like godotenv
   if err := godotenv.Load(); err != nil {
       log.Fatal("Error loading .env file")
   }
   ```

### For Production Deployment

1. **Set environment variables** in your deployment platform
2. **Use secret management services** (AWS Secrets Manager, Azure Key Vault, etc.)
3. **Never hardcode secrets** in configuration files

## Security Best Practices

### ✅ DO
- Use environment variables for all secrets
- Rotate secrets regularly
- Use different secrets for development and production
- Monitor for secret exposure with tools like GitGuardian
- Use secret management services in production
- Limit API key permissions to minimum required

### ❌ DON'T
- Commit secrets to version control
- Share secrets in chat or email
- Use the same secrets across environments
- Hardcode secrets in source code
- Store secrets in client-side code
- Use weak or predictable secrets

## Monitoring and Alerts

- **GitGuardian**: Monitors for secret exposure in repositories
- **Cloudflare Workers**: Logs access to secrets
- **Postmark**: Monitors API usage and alerts on unusual activity

## Emergency Procedures

If secrets are exposed:

1. **Immediately revoke** the exposed secret
2. **Generate new secret** with the same permissions
3. **Update all environments** with the new secret
4. **Deploy updated code** without the exposed secret
5. **Monitor logs** for unauthorized usage
6. **Review access logs** to identify potential compromise

## File Structure

```
project/
├── cloudflare-worker/
│   ├── wrangler.toml          # No secrets here
│   └── src/worker.js          # Uses env.POSTMARK_API_TOKEN
├── backend/
│   ├── .env                   # Local secrets (gitignored)
│   └── api/handlers/email.go  # Uses os.Getenv()
└── .gitignore                 # Excludes .env files
```

## Verification

After setting up secrets:

1. **Test Cloudflare Worker**:
   ```bash
   curl -X POST https://perry-api.sawatzky-perry.workers.dev/email-photos \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"recipientEmail":"test@example.com","message":"test"}'
   ```

2. **Test Go Backend**:
   ```bash
   curl -X POST http://localhost:8080/email \
     -H "Content-Type: application/json" \
     -d '{"message":"test email"}'
   ```

## Support

If you need help with secret management:
- Review this document
- Check the official documentation for each service
- Contact the development team
- Consider using a secrets management consultant 