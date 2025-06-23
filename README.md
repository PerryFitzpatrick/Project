# Perry's Project - Full Stack Web Application

A comprehensive full-stack web application featuring:
- **Frontend**: Angular 19 SPA with authentication, file upload, and email functionality
- **Backend**: Cloudflare Worker with D1 database for authentication and file storage
- **Email Service**: Go backend with Postmark integration for sending emails
- **Deployment**: Automated CI/CD with GitHub Actions and Cloudflare Pages

## 🔐 Security Notice

**⚠️ IMPORTANT**: This project uses sensitive API keys and tokens. Please read [SECURITY.md](./SECURITY.md) for proper secret management procedures.

**Never commit secrets to version control.** All secrets must be managed through environment variables or secret management services.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Go 1.21+
- Cloudflare account with D1 database
- Postmark account for email service

### Local Development

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd Project
npm install
```

2. **Start Angular development server:**
```bash
npm start
# or
ng serve
```
Navigate to `http://localhost:4200/`

3. **Start Go backend (for email service):**
```bash
cd backend
go build -o api-server
./api-server serve
```
Go backend runs on `http://localhost:8080/`

4. **Cloudflare Worker (already deployed):**
- API: `https://perry-api.sawatzky-perry.workers.dev`
- Frontend: `https://perry.click`

## 🏗️ Project Structure

```
Project/
├── src/                    # Angular frontend
│   ├── app/
│   │   ├── home/          # Home page with login, upload, email
│   │   ├── about/         # About page with photo gallery
│   │   └── auth/          # Authentication components
├── backend/               # Go email service
│   ├── api/              # API handlers
│   └── cmd/              # Main application
├── cloudflare-worker/    # Cloudflare Worker backend
├── public/              # Static files (_redirects, _headers)
└── .github/workflows/   # CI/CD pipelines
```

## 🔧 Configuration

### Environment Variables

**Go Backend** (backend/.env - never commit this file):
```env
POSTMARK_API_TOKEN=your_postmark_token
SENDER_EMAIL=your_verified_sender@domain.com
```

**Cloudflare Worker** (secrets managed via wrangler):
```bash
# Set secrets securely (never commit to version control)
cd cloudflare-worker
npx wrangler secret put POSTMARK_API_TOKEN
npx wrangler secret put BUNNY_STORAGE_API_KEY
```

**Configuration files** (safe to commit):
```toml
# cloudflare-worker/wrangler.toml
name = "perry-api"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "perry-db"
database_id = "your_d1_database_id"
```

### GitHub Secrets (for CI/CD)
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `POSTMARK_API_TOKEN` (for Go backend deployment)

**⚠️ Security**: Never commit actual secret values to version control. Use environment variables and secret management services.

## 🚀 Deployment

### Automatic Deployment
The project uses GitHub Actions for automatic deployment:

1. **Frontend**: Pushes to `main` branch automatically deploy to Cloudflare Pages
2. **Worker**: Pushes to `main` branch automatically deploy to Cloudflare Workers

### Manual Deployment

**Deploy Worker:**
```bash
cd cloudflare-worker
npx wrangler deploy
```

**Deploy Frontend:**
```bash
npm run build
# Then push to GitHub (auto-deploys to Cloudflare Pages)
```

## 🔍 Monitoring & Debugging

### View Worker Logs
```bash
cd cloudflare-worker
npx wrangler tail perry-api --format=pretty
```

### View GitHub Actions
- Go to GitHub repository → Actions tab
- Monitor deployment progress and logs

### Common Issues & Solutions

#### 1. Cloudflare RUM 404 Error
**Problem**: `Failed to load resource: the server responded with a status of 404 ()` for `/cdn-cgi/rum`
**Solution**: Ensure `_redirects` and `_headers` files are in `public/` directory and properly configured:
```
# public/_redirects
/*    /index.html   200
/cdn-cgi/*    /cdn-cgi/*   200
/_cf/*    /_cf/*   200
```

#### 2. Wrangler Tail Command Fails
**Problem**: `Required Worker name missing`
**Solution**: Always specify the Worker name:
```bash
npx wrangler tail perry-api --format=pretty
```

#### 3. Angular Build Errors
**Problem**: Missing properties or imports
**Solution**: 
- Check component imports include `CommonModule` for `*ngIf`
- Ensure all template properties exist in component class
- Verify `main.ts` imports correct routes file (`app.routes`, not `app-routing.module`)

#### 4. D1 Database Size Limits
**Problem**: `SQLITE_TOOBIG` error when uploading large files
**Solution**: D1 has a 1MB limit per row. For larger files, use Cloudflare R2 storage.

#### 5. Postmark Email Errors
**Problem**: HTTP 422 errors from Postmark
**Solution**: Verify sender email in Postmark dashboard before using

## 📁 Key Files

### Routing Configuration
- `public/_redirects`: Cloudflare Pages routing
- `public/_headers`: Security and caching headers
- `src/app/app.routes.ts`: Angular routing

### Build Configuration
- `angular.json`: Angular build settings
- `wrangler.toml`: Cloudflare Worker configuration
- `.github/workflows/`: CI/CD pipelines

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

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Security headers (X-Frame-Options, X-Content-Type-Options)
- Input validation and sanitization

## 📧 Email Integration

The Go backend integrates with Postmark for reliable email delivery:
- Simple text field on homepage
- Automatic email sending to configured address
- Error handling and status feedback

## 🖼️ File Upload System

- Image upload with preview
- File type validation
- Size limits (1MB for D1, larger files need R2)
- Gallery display on About page
- User-specific photo storage

## 🚀 Performance Optimizations

- Angular production builds with optimization
- Cloudflare CDN for global distribution
- Proper caching headers
- Lazy loading of components
- Optimized bundle sizes

## 📝 Development Workflow

1. **Make changes** to Angular components or Go backend
2. **Test locally** with `ng serve` and `./api-server serve`
3. **Commit and push** to trigger automatic deployment
4. **Monitor** GitHub Actions and Cloudflare dashboards
5. **Verify** changes on production at `perry.click`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check Cloudflare Worker logs with `wrangler tail`
4. Verify environment variables and configuration

---

**Last Updated**: June 2025
**Deployment Status**: ✅ Live at https://perry.click
**API Status**: ✅ Live at https://perry-api.sawatzky-perry.workers.dev
