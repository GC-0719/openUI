const MCP_BRIDGE = '/api/mcp-bridge';

export async function discoverTools(server) {
  const res = await fetch(`${MCP_BRIDGE}/tools`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transport: server.transport, url: server.url, command: server.command }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.tools || [];
}

export async function callMCPTool(server, toolName, toolArgs = {}) {
  const res = await fetch(`${MCP_BRIDGE}/call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transport: server.transport, url: server.url, command: server.command, tool: toolName, toolArgs }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

// Fetches tool schemas + pre-loads data for no-required-param tools
export async function fetchMCPContext(servers) {
  const serverContexts = [];
  for (const server of servers.filter(s => s.enabled)) {
    try {
      const tools = await discoverTools(server);
      const toolContexts = [];
      for (const tool of tools) {
        const required = tool.inputSchema?.required || [];
        let data = null;
        if (required.length === 0) {
          try { data = await callMCPTool(server, tool.name, {}); } catch { /* live data unavailable */ }
        }
        toolContexts.push({
          name: tool.name,
          description: tool.description || '',
          inputSchema: tool.inputSchema || {},
          data,
        });
      }
      serverContexts.push({ serverLabel: server.label, tools: toolContexts });
    } catch { /* skip unreachable servers */ }
  }
  return serverContexts;
}

// Formats server context for injection into AI system prompts
export function formatMCPContext(serverContexts) {
  if (!serverContexts.length) return '';
  return serverContexts.map(({ serverLabel, tools }) => {
    const toolList = tools.map(t => {
      const props = t.inputSchema?.properties || {};
      const required = t.inputSchema?.required || [];
      const params = Object.entries(props)
        .map(([k, v]) => `${required.includes(k) ? k + '*' : k}: ${v.type || 'any'}${v.description ? ` — ${v.description}` : ''}`)
        .join('; ');
      return `- **${t.name}**(${params || 'no args'}): ${t.description}`;
    }).join('\n');

    const prefetched = tools
      .filter(t => t.data !== null)
      .map(t => `**${t.name}**:\n${typeof t.data === 'string' ? t.data : JSON.stringify(t.data, null, 2)}`)
      .join('\n\n');

    return [
      `## MCP Server: ${serverLabel}`,
      `### Available tools (* = required param):\n${toolList}`,
      prefetched ? `### Pre-fetched data:\n${prefetched}` : '',
    ].filter(Boolean).join('\n');
  }).join('\n\n');
}
