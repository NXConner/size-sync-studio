export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "SizeSeeker API",
    version: "1.0.0",
  },
  servers: [{ url: "http://localhost:3001" }],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: { 200: { description: "OK" } },
      },
    },
    "/chat": {
      post: {
        summary: "Safe chat",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { message: { type: "string" } },
                required: ["message"],
              },
            },
          },
        },
        responses: { 200: { description: "Chat response" } },
      },
    },
    "/chat/stream": {
      get: {
        summary: "Streamed chat (SSE)",
        responses: { 200: { description: "text/event-stream" } },
      },
    },
    "/image/schedule": {
      get: {
        summary: "SVG wellness plan",
        responses: { 200: { description: "SVG image" } },
      },
    },
    "/reddit/gettingbigger": {
      get: {
        summary: "Top posts (titles only)",
        responses: { 200: { description: "JSON list" } },
      },
    },
    "/feedback": {
      post: {
        summary: "Submit feedback",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  reply: { type: "string" },
                  rating: { type: "string", enum: ["up", "down"] },
                  reasons: { type: "array", items: { type: "string" }, maxItems: 5 },
                },
              },
            },
          },
        },
        responses: { 200: { description: "OK" } },
      },
    },
  },
};
