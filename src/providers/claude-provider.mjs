// src/providers/claude-provider.mjs
//
// Default provider — wraps @anthropic-ai/sdk and normalizes the Anthropic Messages response
// into the ChatResult shape inside the binding. The raw vendor response never escapes.
// @anthropic-ai/sdk is imported ONLY here under src/providers/.
import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.mjs';

const DEFAULT_MODEL = 'claude-opus-4-8';

/** @returns {import('./interface/contract.mjs').Provider} */
export function createClaudeProvider() {
  let client = null;
  const getClient = () => (client ??= new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }));

  return {
    get name() {
      return 'claude';
    },
    metered: true,
    capabilities: { chat: true, embed: false },

    async chat(request = {}) {
      const { messages = [], system, model = DEFAULT_MODEL, max_tokens = 1024, ...rest } = request;
      const resp = await getClient().messages.create({
        model,
        max_tokens,
        ...(system ? { system } : {}),
        messages,
        ...rest,
      });
      // Extract text from the content blocks inside the binding — never return the raw response.
      const text = (resp.content ?? [])
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('');
      return {
        text,
        usage: resp.usage ?? null,
        model: resp.model ?? model,
        provider: 'claude',
      };
    },

    async embed() {
      throw new Error('embed not supported by claude provider (capabilities.embed === false)');
    },
  };
}
