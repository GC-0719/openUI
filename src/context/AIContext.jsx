import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AIContext = createContext(null);

const STORAGE_KEY = 'openui-ai-settings';
const KIT_STORAGE_KEY = 'openui-kit-settings';
const MCP_STORAGE_KEY = 'openui-mcp-servers';

export const AI_PROVIDERS = {
  claude: {
    name: 'Claude',
    logo: '◆',
    models: [
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (Recommended)' },
      { id: 'claude-opus-4-7', name: 'Claude Opus 4.7' },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5' },
    ],
    keyPlaceholder: 'sk-ant-api03-…',
  },
  openai: {
    name: 'OpenAI',
    logo: '◉',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o (Recommended)' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    ],
    keyPlaceholder: 'sk-…',
  },
  gemini: {
    name: 'Gemini',
    logo: '✦',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Recommended)' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
    ],
    keyPlaceholder: 'AIzaSy…',
  },
  local: {
    name: 'Local LLM',
    logo: '⚡',
    models: [], // populated dynamically from the running server
    keyPlaceholder: 'optional API key',
  },
};

const defaultSettings = {
  provider: 'claude',
  model: 'claude-sonnet-4-6',
  apiKey: '',
  baseUrl: 'http://localhost:11434/v1',
};
const defaultKit = { kitName: 'openUI', kitPrefix: 'ou' };

export const AIProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) }; }
    catch { return defaultSettings; }
  });

  const [kit, setKit] = useState(() => {
    try { return { ...defaultKit, ...JSON.parse(localStorage.getItem(KIT_STORAGE_KEY)) }; }
    catch { return defaultKit; }
  });

  const [specs, setSpecs] = useState({});

  const [mcpServers, setMcpServers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(MCP_STORAGE_KEY)) || []; }
    catch { return []; }
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(KIT_STORAGE_KEY, JSON.stringify(kit)); }, [kit]);
  useEffect(() => { localStorage.setItem(MCP_STORAGE_KEY, JSON.stringify(mcpServers)); }, [mcpServers]);

  const updateMcpServers = useCallback((servers) => setMcpServers(servers), []);

  useEffect(() => {
    fetch('/api/read-specs')
      .then(r => r.json())
      .then(d => d.specs && setSpecs(d.specs))
      .catch(() => {});
  }, []);

  const updateSettings = (updates) => setSettings(prev => ({ ...prev, ...updates }));
  const updateKit = (updates) => setKit(prev => ({ ...prev, ...updates }));

  const isConfigured = settings.provider === 'local'
    ? Boolean(settings.baseUrl?.trim() && settings.model?.trim())
    : Boolean(settings.apiKey?.trim());

  const updateSpec = useCallback(async (componentId, aiSpec) => {
    await fetch('/api/write-spec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ componentId, aiSpec }),
    });
    setSpecs(prev => ({ ...prev, [componentId]: aiSpec }));
  }, []);

  return (
    <AIContext.Provider value={{ settings, updateSettings, isConfigured, providers: AI_PROVIDERS, kit, updateKit, specs, updateSpec, mcpServers, updateMcpServers }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => useContext(AIContext);
