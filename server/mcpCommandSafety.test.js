import { describe, it, expect } from 'vitest';
import { validateMcpStdioCommand } from './mcpCommandSafety.js';

describe('validateMcpStdioCommand', () => {
  it('allows node with script path', () => {
    expect(validateMcpStdioCommand('node /opt/mcp/server.js').ok).toBe(true);
  });

  it('blocks shell metacharacters', () => {
    expect(validateMcpStdioCommand('node a.js; rm -rf /').ok).toBe(false);
  });

  it('blocks disallowed binaries', () => {
    expect(validateMcpStdioCommand('bash -c echo').ok).toBe(false);
  });
});
