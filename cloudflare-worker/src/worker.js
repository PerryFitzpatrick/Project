// Export the default worker object that handles requests
export default {
  async fetch(request, env, ctx) {
    try {
      // Parse the request URL
      const url = new URL(request.url);
      const path = url.pathname;
      
      // Set CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };

      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: corsHeaders,
        });
      }

      // Handle different endpoints
      let response;
      
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