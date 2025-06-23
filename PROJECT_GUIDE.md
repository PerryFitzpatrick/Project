# 🎯 Project Guide - AI Interface

This file serves as a comprehensive guide for AI assistants and developers to understand, run, and maintain this project. It contains all critical information, common issues, and solutions.

## 🚨 CRITICAL INFORMATION

### Project Overview
- **Type**: Full-stack web application
- **Frontend**: Angular 19 SPA
- **Backend**: Cloudflare Worker + Go API
- **Database**: Cloudflare D1 (SQLite)
- **Email**: Postmark integration
- **Deployment**: Cloudflare Pages + Workers

### Live URLs
- **Frontend**: https://perry.click
- **API**: https://perry-api.sawatzky-perry.workers.dev
- **Go Backend**: http://localhost:8080 (local only)

### Worker Name
- **Always use**: `perry-api` when running wrangler commands
- **Example**: `npx wrangler tail perry-api --format=pretty`

## 🔧 ESSENTIAL COMMANDS

### Development
```bash
# Angular dev server
npm start
# or
ng serve

# Go backend
cd backend
go build -o api-server
./api-server serve

# Worker logs
cd cloudflare-worker
npx wrangler tail perry-api --format=pretty

# Deploy worker
cd cloudflare-worker
npx wrangler deploy
```

### Build & Deploy
```bash
# Build Angular
npm run build

# Deploy (automatic via GitHub Actions)
git add .
git commit -m "description"
git push
```

## 🚨 COMMON ISSUES & SOLUTIONS

### 1. Cloudflare RUM 404 Error
**Error**: `Failed to load resource: the server responded with a status of 404 ()` for `/cdn-cgi/rum`
**Root Cause**: Missing or incorrect routing configuration
**Solution**: 
- Ensure `public/_redirects` contains:
```
/*    /index.html   200
/cdn-cgi/*    /cdn-cgi/*   200
/_cf/*    /_cf/*   200
```
- Ensure `public/_headers` exists with proper caching rules
- Verify `angular.json` assets configuration copies these files

### 2. Wrangler Tail Command Fails
**Error**: `Required Worker name missing`
**Root Cause**: Worker name not specified
**Solution**: Always use `npx wrangler tail perry-api --format=pretty`

### 3. Angular Build Errors
**Error**: Missing properties or imports
**Root Cause**: Component configuration issues
**Solutions**:
- Add `CommonModule` to component imports for `*ngIf`
- Ensure template properties exist in component class
- Verify `main.ts` imports `app.routes` (not `app-routing.module`)

### 4. D1 Database Size Limits
**Error**: `SQLITE_TOOBIG` when uploading files
**Root Cause**: D1 has 1MB limit per row
**Solution**: Use Cloudflare R2 for larger files

### 5. Postmark Email Errors
**Error**: HTTP 422 from Postmark
**Root Cause**: Unverified sender email
**Solution**: Verify sender email in Postmark dashboard

## 📁 CRITICAL FILES

### Routing & Configuration
- `public/_redirects` - Cloudflare Pages routing (CRITICAL for RUM fix)
- `public/_headers` - Security and caching headers
- `src/app/app.routes.ts` - Angular routing
- `angular.json` - Build configuration (assets section critical)

### Backend Configuration
- `cloudflare-worker/wrangler.toml` - Worker configuration
- `backend/.env` - Go backend environment variables
- `.github/workflows/` - CI/CD pipelines

### Key Components
- `src/app/home/home.component.*` - Main homepage
- `src/app/about/about.component.*` - About page with gallery
- `src/app/auth/login-modal/` - Authentication
- `cloudflare-worker/worker.js` - Worker backend logic

## 🔐 SECURITY & ENVIRONMENT

### Required Environment Variables
```env
# Go Backend (.env)
POSTMARK_API_TOKEN=your_token
SENDER_EMAIL=verified@domain.com

# Cloudflare (GitHub Secrets)
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

### Database Schema
```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_data TEXT NOT NULL,
  username TEXT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 DEPLOYMENT WORKFLOW

### Automatic Deployment
1. Push to `main` branch
2. GitHub Actions trigger automatically
3. Frontend deploys to Cloudflare Pages
4. Worker deploys to Cloudflare Workers

### Manual Deployment
```bash
# Worker
cd cloudflare-worker
npx wrangler deploy

# Frontend
npm run build
git add .
git commit -m "deploy"
git push
```

## 🔍 DEBUGGING CHECKLIST

When issues occur, check in this order:

1. **Worker Logs**: `npx wrangler tail perry-api --format=pretty`
2. **GitHub Actions**: Repository → Actions tab
3. **Cloudflare Dashboard**: Pages and Workers sections
4. **Local Testing**: `ng serve` and `./api-server serve`
5. **Browser Console**: Check for JavaScript errors
6. **Network Tab**: Check API calls and responses

## 📝 DEVELOPMENT NOTES

### Angular Standalone Components
- All components use standalone architecture
- Import `CommonModule` for `*ngIf`, `*ngFor`
- Import `FormsModule` for `ngModel`
- Import `HttpClientModule` for API calls

### Cloudflare Worker
- Uses D1 database for storage
- JWT authentication with bcrypt password hashing
- CORS headers for frontend communication
- File upload with base64 encoding

### Go Backend
- Postmark email integration
- CORS middleware for frontend
- Environment variable configuration
- Structured logging

## 🎯 AI ASSISTANT PROTOCOL

When helping with this project:

1. **Always check the worker name**: Use `perry-api` in wrangler commands
2. **Verify routing files**: Ensure `_redirects` and `_headers` are properly configured
3. **Check component imports**: Verify `CommonModule`, `FormsModule`, etc. are imported
4. **Test locally first**: Always test changes with `ng serve` before deploying
5. **Monitor deployments**: Check GitHub Actions and Cloudflare dashboards
6. **Document changes**: Update this guide when solving new issues

## 🚨 EMERGENCY CONTACTS

- **Frontend Issues**: Check Angular build logs and browser console
- **Backend Issues**: Check Worker logs with `wrangler tail`
- **Email Issues**: Verify Postmark configuration and sender verification
- **Deployment Issues**: Check GitHub Actions and Cloudflare dashboards

---

**Last Updated**: June 2025
**Maintainer**: AI Assistant Protocol
**Status**: ✅ Production Ready 