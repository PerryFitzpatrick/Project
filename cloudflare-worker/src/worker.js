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

      // --- PHOTO UPLOAD ENDPOINTS ---
      if (path === '/upload' && method === 'POST') {
        try {
          const formData = await request.formData();
          const file = formData.get('file');
          const username = formData.get('username');

          if (!file || !username) {
            return new Response(JSON.stringify({ message: 'Missing file or username', status: 'error' }), { status: 400, headers: corsHeaders });
          }

          // Check file type
          if (!file.type.startsWith('image/')) {
            return new Response(JSON.stringify({ message: 'Only image files are allowed', status: 'error' }), { status: 400, headers: corsHeaders });
          }

          // Check file size (max 1MB for D1)
          if (file.size > 1024 * 1024) {
            return new Response(JSON.stringify({ message: 'File size must be less than 1MB for D1 storage', status: 'error' }), { status: 400, headers: corsHeaders });
          }

          // Convert file to base64
          const arrayBuffer = await file.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

          console.log('File details:', {
            name: file.name,
            type: file.type,
            size: file.size,
            username: username,
            base64Length: base64.length
          });

          // Store in database
          const result = await env.DB.prepare(`
            INSERT INTO photos (username, filename, file_type, file_size, file_data, uploaded_at) 
            VALUES (?, ?, ?, ?, ?, datetime('now'))
          `).bind(username, file.name, file.type, file.size, base64).run();

          console.log('Database insert result:', result);

          return new Response(JSON.stringify({ 
            message: 'Photo uploaded successfully', 
            status: 'success',
            filename: file.name 
          }), { status: 200, headers: corsHeaders });

        } catch (error) {
          console.error('Upload error:', error);
          console.error('Error stack:', error.stack);
          return new Response(JSON.stringify({ 
            message: 'Upload failed: ' + error.message, 
            status: 'error',
            details: error.stack
          }), { status: 500, headers: corsHeaders });
        }
      }

      // --- BUNNY.NET UPLOAD ENDPOINT ---
      if (path === '/bunny-upload' && method === 'POST') {
        try {
          const formData = await request.formData();
          const file = formData.get('file');
          const username = formData.get('username');

          if (!file || !username) {
            return new Response(JSON.stringify({ message: 'Missing file or username', status: 'error' }), { status: 400, headers: corsHeaders });
          }

          // Check file type - allow more formats for Bunny.net
          const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp',
            'image/heic', 'image/heif', 'image/cr2', 'image/nef', 'image/arw', 'image/dng',
            'video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/wmv', 'video/flv', 'video/webm',
            'video/m4v', 'video/3gp', 'video/mts', 'video/m2ts', 'video/ts'
          ];

          if (!allowedTypes.includes(file.type.toLowerCase())) {
            return new Response(JSON.stringify({ message: 'Unsupported file type', status: 'error' }), { status: 400, headers: corsHeaders });
          }

          // Check file size (max 100MB for Bunny.net)
          if (file.size > 100 * 1024 * 1024) {
            return new Response(JSON.stringify({ message: 'File size must be less than 100MB', status: 'error' }), { status: 400, headers: corsHeaders });
          }

          // Generate unique filename
          const timestamp = Date.now();
          const fileExtension = file.name.split('.').pop();
          const uniqueFilename = `${username}_${timestamp}.${fileExtension}`;
          const cdnUrl = `https://perry.b-cdn.net/uploads/${uniqueFilename}`;

          console.log('Bunny.net upload details:', {
            name: file.name,
            type: file.type,
            size: file.size,
            username: username,
            uniqueFilename: uniqueFilename,
            cdnUrl: cdnUrl
          });

          // Upload file to Bunny.net Storage
          const storageZone = env.BUNNY_STORAGE_ZONE;
          const apiKey = env.BUNNY_STORAGE_API_KEY;
          const endpoint = env.BUNNY_STORAGE_ENDPOINT;
          const filePath = `uploads/${uniqueFilename}`;
          const uploadUrl = `https://${endpoint}/${storageZone}/${filePath}`;

          console.log('Uploading to Bunny.net Storage:', {
            storageZone: storageZone,
            endpoint: endpoint,
            filePath: filePath,
            uploadUrl: uploadUrl
          });

          // Get file data as ArrayBuffer
          const fileData = await file.arrayBuffer();

          // Upload to Bunny.net Storage
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'AccessKey': apiKey,
              'Content-Type': file.type,
              'Content-Length': file.size.toString()
            },
            body: fileData
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Bunny.net upload failed:', {
              status: uploadResponse.status,
              statusText: uploadResponse.statusText,
              error: errorText
            });
            throw new Error(`Bunny.net upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
          }

          console.log('Bunny.net upload successful:', {
            status: uploadResponse.status,
            statusText: uploadResponse.statusText
          });

          // Store metadata in D1 database
          const result = await env.DB.prepare(`
            INSERT INTO bunny_uploads (username, original_filename, unique_filename, file_type, file_size, cdn_url, uploaded_at) 
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
          `).bind(username, file.name, uniqueFilename, file.type, file.size, cdnUrl).run();

          console.log('Bunny.net database insert result:', result);

          return new Response(JSON.stringify({ 
            message: 'File uploaded successfully to Bunny.net', 
            status: 'success',
            filename: file.name,
            cdnUrl: cdnUrl
          }), { status: 200, headers: corsHeaders });

        } catch (error) {
          console.error('Bunny.net upload error:', error);
          console.error('Error stack:', error.stack);
          return new Response(JSON.stringify({ 
            message: 'Bunny.net upload failed: ' + error.message, 
            status: 'error',
            details: error.stack
          }), { status: 500, headers: corsHeaders });
        }
      }

      if (path === '/photos' && method === 'GET') {
        try {
          const photos = await env.DB.prepare(`
            SELECT id, username, filename, file_type, file_size, uploaded_at 
            FROM photos 
            ORDER BY uploaded_at DESC
          `).all();

          return new Response(JSON.stringify({ 
            message: 'Photos retrieved successfully', 
            status: 'success',
            data: photos.results 
          }), { status: 200, headers: corsHeaders });

        } catch (error) {
          console.error('Photos retrieval error:', error);
          return new Response(JSON.stringify({ message: 'Failed to retrieve photos', status: 'error' }), { status: 500, headers: corsHeaders });
        }
      }

      if (path.startsWith('/photo/') && method === 'GET') {
        try {
          const photoId = path.split('/')[2];
          const photo = await env.DB.prepare('SELECT * FROM photos WHERE id = ?').bind(photoId).first();

          if (!photo) {
            return new Response(JSON.stringify({ message: 'Photo not found', status: 'error' }), { status: 404, headers: corsHeaders });
          }

          // Convert base64 back to binary
          const binaryString = atob(photo.file_data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          return new Response(bytes, {
            status: 200,
            headers: {
              'Content-Type': photo.file_type,
              'Content-Disposition': `inline; filename="${photo.filename}"`,
              ...corsHeaders
            }
          });

        } catch (error) {
          console.error('Photo retrieval error:', error);
          return new Response(JSON.stringify({ message: 'Failed to retrieve photo', status: 'error' }), { status: 500, headers: corsHeaders });
        }
      }

      // --- BUNNY.NET UPLOADS ENDPOINTS ---
      if (path === '/bunny-uploads' && method === 'GET') {
        try {
          const uploads = await env.DB.prepare(`
            SELECT id, username, original_filename, unique_filename, file_type, file_size, cdn_url, uploaded_at 
            FROM bunny_uploads 
            ORDER BY uploaded_at DESC
          `).all();

          return new Response(JSON.stringify({ 
            message: 'Bunny.net uploads retrieved successfully', 
            status: 'success',
            data: uploads.results 
          }), { status: 200, headers: corsHeaders });

        } catch (error) {
          console.error('Bunny.net uploads retrieval error:', error);
          return new Response(JSON.stringify({ message: 'Failed to retrieve Bunny.net uploads', status: 'error' }), { status: 500, headers: corsHeaders });
        }
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