import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

// Helper to read JSON body
async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// Helper to create JWT
async function createJwt(payload, secret) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(secret));
}

// Export the default worker object that handles requests
export default {
  async fetch(request, env, ctx) {
    try {
      // Parse the request URL
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;
      
      // Set CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };

      // Handle preflight requests
      if (method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: corsHeaders,
        });
      }

      // Handle different endpoints
      let response;
      
      // --- AUTH ENDPOINTS ---
      if (path === '/auth/register' && method === 'POST') {
        const data = await readJson(request);
        if (!data || !data.email || !data.password || !data.username) {
          return new Response(JSON.stringify({ message: 'Missing fields', status: 'error' }), { status: 400, headers: corsHeaders });
        }
        // Check if user exists
        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ? OR username = ?').bind(data.email, data.username).first();
        if (existing) {
          return new Response(JSON.stringify({ message: 'Email or username already in use', status: 'error' }), { status: 409, headers: corsHeaders });
        }
        // Hash password
        const hash = bcrypt.hashSync(data.password, 10);
        // Insert user
        await env.DB.prepare('INSERT INTO users (email, password_hash, username) VALUES (?, ?, ?)').bind(data.email, hash, data.username).run();
        return new Response(JSON.stringify({ message: 'User registered', status: 'success' }), { status: 201, headers: corsHeaders });
      }

      if (path === '/auth/login' && method === 'POST') {
        const data = await readJson(request);
        if (!data || !data.email || !data.password) {
          return new Response(JSON.stringify({ message: 'Missing fields', status: 'error' }), { status: 400, headers: corsHeaders });
        }
        // Find user
        const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(data.email).first();
        if (!user) {
          return new Response(JSON.stringify({ message: 'Invalid credentials', status: 'error' }), { status: 401, headers: corsHeaders });
        }
        // Check password
        const valid = bcrypt.compareSync(data.password, user.password_hash);
        if (!valid) {
          return new Response(JSON.stringify({ message: 'Invalid credentials', status: 'error' }), { status: 401, headers: corsHeaders });
        }
        // Create JWT
        const jwt = await createJwt({ sub: user.id, email: user.email, username: user.username }, env.JWT_SECRET || 'dev_secret');
        return new Response(JSON.stringify({ message: 'Login successful', status: 'success', token: jwt }), { status: 200, headers: corsHeaders });
      }

      // --- EXISTING ENDPOINTS ---
      switch (path) {
        case '/test':
          response = {
            message: 'Backend API is running successfully!',
            status: 'healthy',
            data: {
              version: '1.0.0',
              platform: 'Cloudflare Workers',
            },
          };
          break;
          
        case '/hello':
          response = {
            message: 'Hello from Cloudflare Workers!',
            status: 'success',
            data: {
              greeting: 'Hello, World!',
            },
          };
          break;
          
        default:
          response = {
            message: 'Endpoint not found',
            status: 'error',
            data: {
              path: path,
            },
          };
      }
      
      // Return the response with proper headers
      return new Response(JSON.stringify(response), {
        status: response.status === 'error' ? 404 : 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
      
    } catch (error) {
      console.error('Worker error:', error);
      
      // Return error response
      return new Response(JSON.stringify({
        message: 'Internal server error',
        status: 'error',
        data: {
          error: error.message,
        },
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};