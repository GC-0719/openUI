import { describe, it, expect } from 'vitest';
import {
  parseOpenAPISpec,
  parsePrismaSchema,
  scaffoldMcpServer,
  sanitizeToolName,
} from './mcpScaffold.js';

describe('sanitizeToolName', () => {
  it('normalizes operation ids', () => {
    expect(sanitizeToolName('get /users/{id}')).toBe('get_users_id');
  });
});

describe('parseOpenAPISpec', () => {
  it('extracts tools from paths', () => {
    const spec = {
      openapi: '3.0.0',
      servers: [{ url: 'https://api.example.com/v1' }],
      paths: {
        '/users': {
          get: { operationId: 'listUsers', summary: 'List users' },
          post: { summary: 'Create user', requestBody: { content: { 'application/json': { schema: { properties: { name: { type: 'string' } } } } } } },
        },
        '/users/{id}': {
          get: { operationId: 'getUser', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] },
        },
      },
    };
    const r = parseOpenAPISpec(spec);
    expect(r.ok).toBe(true);
    expect(r.tools.length).toBe(3);
    expect(r.tools.find(t => t.name === 'listUsers').method).toBe('GET');
    expect(r.baseUrl).toBe('https://api.example.com/v1');
  });
});

describe('parsePrismaSchema', () => {
  it('parses models and fields', () => {
    const text = `
model User {
  id    Int     @id
  email String  @unique
  name  String?
}

model Post {
  id     Int    @id
  title  String
  userId Int
}
`;
    const r = parsePrismaSchema(text);
    expect(r.ok).toBe(true);
    expect(r.models).toHaveLength(2);
    expect(r.models[0].fields.some(f => f.name === 'email')).toBe(true);
    expect(r.tools.some(t => t.name === 'describe_user')).toBe(true);
  });
});

describe('scaffoldMcpServer', () => {
  it('returns runnable bundle for openapi', () => {
    const r = scaffoldMcpServer({
      source: 'openapi',
      serverName: 'My API',
      baseUrl: 'http://localhost:4000',
      spec: {
        openapi: '3.0.0',
        paths: { '/health': { get: { summary: 'Health check' } } },
      },
    });
    expect(r.ok).toBe(true);
    expect(r.files['index.js']).toContain('get_health');
    expect(r.files['index.js']).toContain('@modelcontextprotocol/sdk');
    expect(r.files['package.json']).toContain('my-api-mcp');
  });

  it('returns prisma bundle', () => {
    const r = scaffoldMcpServer({
      source: 'prisma',
      serverName: 'Data',
      spec: 'model Item { id Int @id name String }',
    });
    expect(r.ok).toBe(true);
    expect(r.files['index.js']).toContain('list_models');
    expect(r.meta.modelCount).toBe(1);
  });
});
