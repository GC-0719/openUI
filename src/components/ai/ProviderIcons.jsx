import { Cpu } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';

const svgProps = (size) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true,
});

/** Anthropic / Claude mark (monochrome). */
export function ClaudeIcon({ size = 16, className }) {
  return (
    <svg {...svgProps(size)} className={className}>
      <rect width="24" height="24" rx="6" fill="#0a0a0a" />
      <path
        d="M12 5.5c-2.2 3.8-3.6 6.4-4.2 7.8-.5 1.2-.2 2.2.9 2.9 1 .6 2 .5 2.8-.2.8-.7 1.5-2 2.1-3.9.4-1.2.9-2.4 1.5-3.6L12 5.5Z"
        fill="#fff"
        opacity="0.95"
      />
      <path
        d="M12 18.5c2.2-3.8 3.6-6.4 4.2-7.8.5-1.2.2-2.2-.9-2.9-1-.6-2-.5-2.8.2-.8.7-1.5 2-2.1 3.9-.4 1.2-.9 2.4-1.5 3.6L12 18.5Z"
        fill="#fff"
        opacity="0.55"
      />
    </svg>
  );
}

/** OpenAI / GPT mark (monochrome). */
export function OpenAIIcon({ size = 16, className }) {
  return (
    <svg {...svgProps(size)} className={className}>
      <rect width="24" height="24" rx="6" fill="#0a0a0a" />
      <path
        fill="#fff"
        d="M12 6.2a4.2 4.2 0 0 1 3.4 1.7 3.6 3.6 0 0 1 .5 3.8 4.5 4.5 0 0 1-2 2.2 3.8 3.8 0 0 1-4.2-.3 4.8 4.8 0 0 1-2.2-2.5 3.2 3.2 0 0 1 .1-3.6A4.2 4.2 0 0 1 12 6.2Zm0 11.6a4.2 4.2 0 0 0-3.4-1.7 3.6 3.6 0 0 0-.5-3.8 4.5 4.5 0 0 0 2-2.2 3.8 3.8 0 0 0 4.2.3 4.8 4.8 0 0 0 2.2 2.5 3.2 3.2 0 0 0-.1 3.6 4.2 4.2 0 0 0-3.4 1.7Z"
      />
    </svg>
  );
}

/** Google Gemini mark (monochrome star). */
export function GeminiIcon({ size = 16, className }) {
  return (
    <svg {...svgProps(size)} className={className}>
      <rect width="24" height="24" rx="6" fill="#0a0a0a" />
      <path
        fill="#fff"
        d="M12 5l1.4 4.3H18l-3.5 2.5 1.3 4.2L12 13.4 8.2 16l1.3-4.2L6 9.3h4.6L12 5Z"
      />
    </svg>
  );
}

/** Local LLM (Ollama / LM Studio, etc.). */
export function LocalLLMIcon({ size = 16, className }) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: 6,
        border: '1px solid #0a0a0a',
        background: '#fafafa',
        color: '#0a0a0a',
      }}
    >
      <Cpu size={Math.round(size * 0.62)} strokeWidth={2} />
    </span>
  );
}

const PROVIDER_ICONS = {
  claude: ClaudeIcon,
  openai: OpenAIIcon,
  gemini: GeminiIcon,
  local: LocalLLMIcon,
};

export function ProviderIcon({ provider, size = 16, className }) {
  const Icon = PROVIDER_ICONS[provider] || ClaudeIcon;
  return <Icon size={size} className={className} />;
}

/** openUI agent avatar (studio agent panel + messages). */
export function OpenUIAgentIcon({ size = 16, className }) {
  return <BrandLogo size={size} mono className={className} style={{ display: 'block' }} />;
}
