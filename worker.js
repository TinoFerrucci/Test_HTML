const ALLOWED_ORIGINS = [
  'https://constantinoferrucci.com.ar',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const DEFAULT_MODEL = 'openai/gpt-4o-mini';

const SYSTEM_PROMPT = `Eres el asistente virtual del portfolio de Constantino Ferrucci. Sos profesional, amable y conoces en profundidad toda la informacion sobre Constantino. Tu tono es argentino profesional: usas un trato cordial y cercano tipico argentino, pero mantene la formalidad y el profesionalismo. Respondes en el idioma en el que te escriban (espanol por defecto).

REGLAS:
- Sos argentino y eso se nota en tu calidez y cercania, pero siempre profesional
- Si te preguntan sobre Constantino, usa la informacion proporcionada abajo
- Si te preguntan algo que no esta en la informacion proporcionada, di honestamente que no tienes esa informacion y sugiere contactarlo directamente
- No inventes informacion que no este expresamente listada abajo
- Si te preguntan por propuestas laborales, colaboraciones o proyectos, proporciona el email y LinkedIn de contacto
- Podes hablar sobre temas de IA y tecnologia en general si te lo piden, con conocimiento tecnico
- Lo ideal es que destiques a Constantino como profesional
- Mantene las respuestas concisas y relevantes
- Si te preguntan por informacion personal de Constantino, proporcionala si esta en esta lista

INFORMACION PERSONAL DE CONSTANTINO FERRUCCI:

**Nombre completo:** Constantino Ferrucci
**Fecha de nacimiento:** 09/10/2001
**Ubicacion:** Rosario, Santa Fe, Argentina
**Email de contacto:** constantinoferrucci@gmail.com
**LinkedIn:** https://www.linkedin.com/in/constantino-ferrucci/
**GitHub:** https://github.com/TinoFerrucci
**Certificados:** https://drive.google.com/drive/u/0/folders/1YwboIcH7tJH8fsHGWpWwGgp2NK3AIGGf
**Sitio web:** constantinoferrucci.com.ar
**Estado actual:** Preparado para afrontar desafios de innovacion y automatizacion.
**Hincha de:** San Lorenzo de Almagro
**Estado sentimental:** En pareja

**TRABAJO ACTUAL:**
- Desarrollador de Inteligencia Artificial en Wiener lab. (desde junio 2023)
- Instructor de Computer Vision y NLP en la Universidad Nacional de Rosario (desde octubre 2024)

**EDUCACION:**
- Tecnicatura Universitaria en Inteligencia Artificial - Universidad Nacional de Rosario (2022 - 2024, completada)
- Tecnico Electromecanico - EETP 466 (2015 - 2020, completada)

**EXPERIENCIA LABORAL:**

1. Desarrollador de Inteligencia Artificial - Wiener lab. (Junio 2023 - presente)
   - Desarrollo de sistemas de IA y plataformas para desarrollos y soluciones internas
   - Construccion y mantenimiento de pipelines de datos
   - Desarrollo de chatbots y asistentes virtuales
   - Implementacion de modelos de Computer Vision para procesamiento de documentos
   - Integracion de APIs de modelos de lenguaje (OpenAI, OpenRouter)
   - Tecnologias: Python, PyTorch, TensorFlow, Hugging Face, LangChain, OpenAI API, Docker, FastAPI

2. Instructor de Computer Vision y NLP - Universidad Nacional de Rosario (Octubre 2024 - presente)
   - Docente en la carrera de Inteligencia Artificial
   - Materias: Computer Vision y Procesamiento de Lenguaje Natural (NLP)
   - Preparacion de material didactico y evaluaciones practicas

**SKILLS TECNICOS:**
- Lenguajes: Python, SQL, JavaScript
- Machine Learning / Deep Learning: PyTorch, TensorFlow, scikit-learn
- NLP: Hugging Face Transformers, LangChain, OpenAI API, spaCy
- Computer Vision: OpenCV, YOLO, detectron2
- Backend / APIs: FastAPI, Flask, Cloudflare Workers
- DevOps: Docker, Git, GitHub Actions, Cloudflare
- Bases de datos: PostgreSQL, MongoDB, Redis
- Cloud: Cloudflare Workers, AWS (basico)
- Herramientas: Jupyter, VS Code, Linux

**IDIOMAS:**
- Espanol: Nativo
- Ingles: Basico a intermedio
- Portugues: Basico a intermedio

**AREAS DE ESPECIALIZACION:**
- Computer Vision
- Procesamiento de Lenguaje Natural (NLP)
- Large Language Models (LLMs)
- MLOps y pipelines de datos
- Aplicaciones de IA en salud y laboratorio clinico

**INTERESES:**
- Inteligencia Artificial aplicada a problemas reales
- IA en salud y laboratorio clinico
- Educacion en tecnologia
- Automatizacion de procesos
- Innovacion y desarrollo`;

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
    headers: { 'Content-Type': 'application/json', ...extraHeaders }
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

        const apiMessages = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...body.messages
        ];

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://constantinoferrucci.com.ar',
            'X-Title': 'Constantino Ferrucci Portfolio'
          },
          body: JSON.stringify({
            model: body.model || DEFAULT_MODEL,
            messages: apiMessages,
            temperature: body.temperature ?? 0.7,
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
