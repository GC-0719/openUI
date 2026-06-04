/**
 * Guardrails for user-configured MCP stdio commands (local dev only).
 */

const BLOCKED_PATTERN = /[;&|`$<>()\n\r]|&&|\|\|/;

/**
 * @param {string} command — full stdio command line from user settings
 */
export function validateMcpStdioCommand(command) {
  if (!command || typeof command !== 'string') {
    return { ok: false, error: 'MCP command is required' };
  }
  const trimmed = command.trim();
  if (!trimmed) return { ok: false, error: 'MCP command is required' };
  if (trimmed.length > 2048) {
    return { ok: false, error: 'MCP command is too long' };
  }
  if (BLOCKED_PATTERN.test(trimmed)) {
    return { ok: false, error: 'MCP command cannot contain shell metacharacters (; & | ` $ < > etc.)' };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (!parts.length) return { ok: false, error: 'MCP command is required' };

  const bin = parts[0];
  const allowedBins = new Set(['node', 'npx', 'python', 'python3', 'uv', 'uvx']);
  const binName = pathBasename(bin);
  if (!allowedBins.has(binName)) {
    return {
      ok: false,
      error: `MCP executable must be one of: ${[...allowedBins].join(', ')} (got "${binName}")`,
    };
  }

  return { ok: true, argv: parts };
}

function pathBasename(cmd) {
  const idx = Math.max(cmd.lastIndexOf('/'), cmd.lastIndexOf('\\'));
  return idx >= 0 ? cmd.slice(idx + 1) : cmd;
}
