# Perry API Cloudflare Worker

This is a simple Go-based Cloudflare Worker that serves as the backend API for the application.

## Prerequisites

- Go 1.21 or later
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account with Workers enabled

## Development

1. Install dependencies:
```bash
go mod tidy
```

2. Login to Cloudflare (if not already logged in):
```bash
wrangler login
```

3. Start the development server:
```bash
wrangler dev
```

The worker will be available at `http://localhost:8787` during development.

## Building

To build the worker:
```bash
GOOS=js GOARCH=wasm go build -o main.wasm
```

## Deployment

To deploy to production:
```bash
wrangler deploy
```

To deploy to development environment:
```bash
wrangler deploy --env development
```

## API Endpoints

### GET /
Returns a simple hello message.

Response:
```json
{
  "message": "Hello from Cloudflare Worker!"
}
```

## Configuration

The worker is configured using `wrangler.toml`. The main configuration options are:

- Production environment: `api.perry.click/*`
- Development environment: Workers.dev subdomain

## CORS

The worker is configured to allow requests from your Angular frontend domain. Make sure to update the CORS headers if you change the frontend domain. 

export default {
  async fetch(request, env, ctx) {
    // Your worker code here
  }
}; # test
