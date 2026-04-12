const ALLOWED_ORIGINS = [
  'https://constantinoferrucci.com.ar',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    return { ...CORS_HEADERS, 'Access-Control-Allow-Origin': origin };
  }
  return CORS_HEADERS;
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders
    }
  });
}

function errorResponse(message, status = 500, extraHeaders = {}) {
  return jsonResponse({ error: { message } }, status, extraHeaders);
}

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (!env.OPENROUTER_API_KEY) {
      return errorResponse('API key not configured', 500, corsHeaders);
    }

    const url = new URL(request.url);

    if (url.pathname === '/models') {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { 'Authorization': `Bearer ${env.OPENROUTER_API_KEY}` }
        });
        const data = await res.json();
        return jsonResponse(data, res.status, corsHeaders);
      } catch (err) {
        return errorResponse('Failed to fetch models', 502, corsHeaders);
      }
    }

    if (url.pathname === '/chat' && request.method === 'POST') {
      try {
        const body = await request.json();

        if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
          return errorResponse('messages is required and must be a non-empty array', 400, corsHeaders);
        }

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://constantinoferrucci.com.ar',
            'X-Title': 'Constantino Ferrucci Portfolio'
          },
          body: JSON.stringify({
            model: body.model || 'openai/gpt-4o-mini',
            messages: body.messages,
            temperature: body.temperature ?? 0.8,
            max_tokens: body.max_tokens ?? 1024
          })
        });
        const data = await res.json();

        if (data.error) {
          return errorResponse(data.error.message || 'OpenRouter error', res.status, corsHeaders);
        }

        return jsonResponse(data, res.status, corsHeaders);
      } catch (err) {
        return errorResponse('Invalid request body', 400, corsHeaders);
      }
    }

    return new Response('Constantino Ferrucci API', {
      status: 200,
      headers: corsHeaders
    });
  }
};
