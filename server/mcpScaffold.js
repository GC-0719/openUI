/**
 * Scaffold minimal MCP servers from OpenAPI or Prisma schema (0.4.x MCP wizard).
 */

const MAX_OPENAPI_TOOLS = 40;
const MAX_SPEC_CHARS = 512_000;

export function sanitizeToolName(name) {
  return String(name)
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 64) || 'api_call';
}

function schemaToProperties(schema) {
  if (!schema || typeof schema !== 'object') return {};
  if (schema.$ref) return {};
  const props = {};
  const obj = schema.properties || (schema.type === 'object' ? schema.properties : null);
  if (obj) {
    for (const [k, v] of Object.entries(obj)) {
      props[k] = {
        type: v?.type || 'string',
        description: v?.description || '',
      };
    }
  }
  return props;
}

function buildInputSchema(op) {
  const properties = {};
  const required = [];
  for (const p of op.parameters || []) {
    if (p.in === 'path' || p.in === 'query') {
      properties[p.name] = {
        type: p.schema?.type || 'string',
        description: p.description || `${p.in} parameter`,
      };
      if (p.required) required.push(p.name);
    }
  }
  const bodySchema = op.requestBody?.content?.['application/json']?.schema;
  Object.assign(properties, schemaToProperties(bodySchema));
  return {
    type: 'object',
    properties,
    ...(required.length ? { required } : {}),
  };
}

/**
 * @param {object|string} spec — OpenAPI 3.x JSON
 */
export function parseOpenAPISpec(spec) {
  if (typeof spec === 'string') {
    if (spec.length > MAX_SPEC_CHARS) {
      return { ok: false, error: 'Spec too large (max 512KB)' };
    }
    try {
      spec = JSON.parse(spec);
    } catch {
      return { ok: false, error: 'OpenAPI must be valid JSON (paste the spec as JSON)' };
    }
  }
  if (!spec || typeof spec !== 'object') {
    return { ok: false, error: 'Missing OpenAPI document' };
  }
  if (!spec.paths) {
    return { ok: false, error: 'OpenAPI document has no paths' };
  }

  const baseUrl = (spec.servers?.[0]?.url || '').replace(/\/$/, '');
  const tools = [];

  for (const [pathKey, methods] of Object.entries(spec.paths)) {
    if (!methods || typeof methods !== 'object') continue;
    for (const [method, op] of Object.entries(methods)) {
      if (!op || typeof op !== 'object') continue;
      const m = method.toLowerCase();
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(m)) continue;

      const name = sanitizeToolName(
        op.operationId || `${m}_${pathKey.replace(/[{}]/g, '').replace(/\//g, '_')}`
      );
      tools.push({
        name,
        description: (op.summary || op.description || `${m.toUpperCase()} ${pathKey}`).slice(0, 400),
        method: m.toUpperCase(),
        path: pathKey,
        inputSchema: buildInputSchema(op),
      });
      if (tools.length >= MAX_OPENAPI_TOOLS) break;
    }
    if (tools.length >= MAX_OPENAPI_TOOLS) break;
  }

  if (!tools.length) {
    return { ok: false, error: 'No HTTP operations found in OpenAPI paths' };
  }

  return {
    ok: true,
    kind: 'openapi',
    title: spec.info?.title || 'API',
    baseUrl,
    tools,
  };
}

/**
 * @param {string} text — Prisma schema source
 */
export function parsePrismaSchema(text) {
  if (!text?.trim()) return { ok: false, error: 'Empty Prisma schema' };
  if (text.length > MAX_SPEC_CHARS) {
    return { ok: false, error: 'Schema too large (max 512KB)' };
  }

  const models = [];
  const modelRe = /model\s+(\w+)\s*\{([^}]*)\}/g;
  let match;
  while ((match = modelRe.exec(text)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields = [];
    for (const line of body.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) continue;
      const fm = trimmed.match(/^(\w+)\s+(\w+)/);
      if (!fm) continue;
      const [, fieldName, fieldType] = fm;
      if (['model', 'enum'].includes(fieldName)) continue;
      fields.push({
        name: fieldName,
        type: fieldType,
        optional: trimmed.includes('?'),
        isList: fieldType.endsWith('[]'),
      });
    }
    models.push({ name, fields });
  }

  if (!models.length) {
    return { ok: false, error: 'No model blocks found — paste a Prisma schema with model definitions' };
  }

  const tools = [
    {
      name: 'list_models',
      description: 'List all Prisma data models available in this schema',
      inputSchema: { type: 'object', properties: {} },
    },
    ...models.map(m => ({
      name: `describe_${m.name.toLowerCase()}`,
      description: `Get fields and types for the ${m.name} model`,
      inputSchema: { type: 'object', properties: {} },
      modelName: m.name,
    })),
  ];

  return { ok: true, kind: 'prisma', title: 'Prisma schema', models, tools };
}

function escapeForJsString(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function generateOpenApiServerIndex({ serverName, tools, baseUrl }) {
  const toolsJson = JSON.stringify(tools, null, 2);
  const slug = sanitizeToolName(serverName).toLowerCase();

  return `#!/usr/bin/env node
// ${serverName} — MCP server generated by openUI (OpenAPI)
// Proxies API operations as MCP tools for AI clients.

const BASE_URL = (process.env.API_BASE_URL || '${escapeForJsString(baseUrl || 'http://localhost:3000')}').replace(/\\/$/, '');
const TOOLS = ${toolsJson};

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

function buildUrl(pathTemplate, args) {
  return BASE_URL + pathTemplate.replace(/\\{(\\w+)\\}/g, (_, key) => encodeURIComponent(args[key] ?? ''));
}

function buildQuery(pathTemplate, args) {
  const url = new URL(buildUrl(pathTemplate, args));
  const pathParams = new Set([...pathTemplate.matchAll(/\\{(\\w+)\\}/g)].map(m => m[1]));
  for (const [k, v] of Object.entries(args)) {
    if (!pathParams.has(k) && v !== undefined && v !== '') url.searchParams.set(k, String(v));
  }
  return url.toString();
}

async function invokeTool(name, args) {
  const tool = TOOLS.find(t => t.name === name);
  if (!tool) throw new Error('Unknown tool: ' + name);

  const bodyKeys = Object.keys(tool.inputSchema?.properties || {}).filter(k => {
    return !tool.path.includes('{' + k + '}');
  });
  let body;
  if (['POST', 'PUT', 'PATCH'].includes(tool.method)) {
    body = {};
    for (const k of bodyKeys) {
      if (args[k] !== undefined) body[k] = args[k];
    }
    if (!Object.keys(body).length) body = undefined;
  }

  const url = tool.method === 'GET' || tool.method === 'DELETE'
    ? buildQuery(tool.path, args)
    : buildUrl(tool.path, args);

  const res = await fetch(url, {
    method: tool.method,
    headers: body ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, ok: res.ok, data };
}

const server = new Server(
  { name: '${slug}', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map(t => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;
  try {
    const result = await invokeTool(name, args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('${serverName} MCP server running on stdio (API: ' + BASE_URL + ')');
}

main().catch(err => { console.error(err); process.exit(1); });
`;
}

function generatePrismaServerIndex({ serverName, models }) {
  const modelsJson = JSON.stringify(models, null, 2);
  const slug = sanitizeToolName(serverName).toLowerCase();

  return `#!/usr/bin/env node
// ${serverName} — MCP server generated by openUI (Prisma schema)
// Exposes data models and fields for AI UI generation.

const MODELS = ${modelsJson};

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

const server = new Server(
  { name: '${slug}', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_models',
      description: 'List Prisma model names and field counts',
      inputSchema: { type: 'object', properties: {} },
    },
    ...MODELS.map(m => ({
      name: 'describe_' + m.name.toLowerCase(),
      description: 'Fields and types for the ' + m.name + ' model',
      inputSchema: { type: 'object', properties: {} },
    })),
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name } = req.params;
  try {
    if (name === 'list_models') {
      const summary = MODELS.map(m => ({ name: m.name, fields: m.fields.length }));
      return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
    }
    const prefix = 'describe_';
    if (name.startsWith(prefix)) {
      const modelName = name.slice(prefix.length);
      const model = MODELS.find(m => m.name.toLowerCase() === modelName);
      if (!model) throw new Error('Unknown model: ' + modelName);
      return { content: [{ type: 'text', text: JSON.stringify(model, null, 2) }] };
    }
    throw new Error('Unknown tool: ' + name);
  } catch (err) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('${serverName} Prisma MCP server running on stdio');
}

main().catch(err => { console.error(err); process.exit(1); });
`;
}

/**
 * @returns {{ ok: true, files: Record<string, string>, meta: object } | { ok: false, error: string }}
 */
export function scaffoldMcpServer({ source, spec, serverName, baseUrl }) {
  const name = (serverName || 'My Backend').trim();
  if (!name) return { ok: false, error: 'Server name is required' };

  const slug = sanitizeToolName(name).toLowerCase().replace(/_/g, '-');

  if (source === 'openapi') {
    const parsed = parseOpenAPISpec(spec);
    if (!parsed.ok) return parsed;
    const apiBase = (baseUrl || parsed.baseUrl || '').trim();
    if (!apiBase) {
      return { ok: false, error: 'API base URL is required (or include servers[0].url in the OpenAPI spec)' };
    }

    const files = {
      'package.json': JSON.stringify({
        name: `${slug}-mcp`,
        version: '1.0.0',
        description: `MCP server for ${name} (OpenAPI)`,
        type: 'commonjs',
        main: 'index.js',
        bin: { [`${slug}-mcp`]: './index.js' },
        scripts: { start: 'node index.js' },
        dependencies: { '@modelcontextprotocol/sdk': '^1.0.0' },
      }, null, 2),
      'index.js': generateOpenApiServerIndex({ serverName: name, tools: parsed.tools, baseUrl: apiBase }),
      '.env.example': `API_BASE_URL=${apiBase}\n`,
      'README.md': `# ${name} MCP Server\n\nGenerated by [openUI](https://github.com/GC-0719/openUI) from an OpenAPI spec.\n\n## Setup\n\n\`\`\`bash\nnpm install\n\`\`\`\n\n## Run (stdio)\n\n\`\`\`bash\nAPI_BASE_URL=${apiBase} node index.js\n\`\`\`\n\n## Claude Desktop\n\n\`\`\`json\n{\n  "mcpServers": {\n    "${slug}": {\n      "command": "node",\n      "args": ["/absolute/path/to/${slug}-mcp/index.js"],\n      "env": { "API_BASE_URL": "${apiBase}" }\n    }\n  }\n}\n\`\`\`\n\n## openUI studio\n\nAdd an MCP server with transport **stdio** and command:\n\`node /absolute/path/to/${slug}-mcp/index.js\`\n`,
    };

    return {
      ok: true,
      files,
      meta: {
        kind: 'openapi',
        toolCount: parsed.tools.length,
        title: parsed.title,
        baseUrl: apiBase,
        slug,
      },
    };
  }

  if (source === 'prisma') {
    const parsed = parsePrismaSchema(typeof spec === 'string' ? spec : '');
    if (!parsed.ok) return parsed;

    const files = {
      'package.json': JSON.stringify({
        name: `${slug}-mcp`,
        version: '1.0.0',
        description: `MCP server for ${name} (Prisma schema)`,
        type: 'commonjs',
        main: 'index.js',
        bin: { [`${slug}-mcp`]: './index.js' },
        scripts: { start: 'node index.js' },
        dependencies: { '@modelcontextprotocol/sdk': '^1.0.0' },
      }, null, 2),
      'index.js': generatePrismaServerIndex({ serverName: name, models: parsed.models }),
      'README.md': `# ${name} MCP Server\n\nPrisma schema introspection for AI clients (generated by openUI).\n\n## Setup\n\n\`\`\`bash\nnpm install\nnode index.js\n\`\`\`\n\n## Tools\n\n- \`list_models\` — all model names\n- \`describe_<model>\` — fields per model\n\n## openUI studio\n\nAdd MCP server (stdio): \`node /absolute/path/to/${slug}-mcp/index.js\`\n`,
    };

    return {
      ok: true,
      files,
      meta: {
        kind: 'prisma',
        modelCount: parsed.models.length,
        toolCount: parsed.tools.length,
        slug,
      },
    };
  }

  return { ok: false, error: 'source must be "openapi" or "prisma"' };
}
