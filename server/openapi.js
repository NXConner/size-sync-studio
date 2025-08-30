export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'SizeSeeker API',
    version: '1.0.0',
  },
  servers: [{ url: 'http://localhost:3001' }],
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/chat': {
      post: {
        summary: 'Safe chat',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { message: { type: 'string' } },
                required: ['message'],
              },
            },
          },
        },
        responses: { '200': { description: 'Chat response' } },
      },
    },
    '/api/image/schedule': {
      get: {
        summary: 'SVG wellness plan',
        responses: { '200': { description: 'SVG image' } },
      },
    },
    '/api/reddit/gettingbigger': {
      get: {
        summary: 'Top posts (titles only)',
        responses: { '200': { description: 'JSON list' } },
      },
    },
  },
};

