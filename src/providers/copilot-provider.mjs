// src/providers/copilot-provider.mjs
//
// Alternate provider — wraps the GitHub Copilot SDK (the `copilot-sdk` skill; upstream
// github.com/multistageharness/llm-sdk-github-copilot, published as `@github/copilot-sdk`).
// Both chat() and embed() are normalized into the shared ChatResult / EmbedResult shapes; no
// vendor shape leaks past this boundary. The SDK is imported lazily (dynamic import) ONLY here
// so this module loads even when the optional SDK / Copilot CLI is not installed — the selector
// only constructs this provider when a credential is present.
import { env } from '../config/env.mjs';

const DEFAULT_MODEL = 'gpt-4.1';

async function getClient() {
  const { CopilotClient } = await import('@github/copilot-sdk');
  return new CopilotClient({ token: env.COPILOT_TOKEN });
}

/** @returns {import('./interface/contract.mjs').Provider} */
export function createCopilotProvider() {
  return {
    get name() {
      return 'copilot';
    },
    metered: true,
    capabilities: { chat: true, embed: true },

    async chat(request = {}) {
      const { messages = [], prompt, model = DEFAULT_MODEL } = request;
      const client = await getClient();
      const session = await client.createSession({ model });
      const text = prompt ?? messages.map((m) => m.content).join('\n');
      const resp = await session.sendAndWait({ prompt: text });
      await client.stop?.();
      // Normalize to ChatResult { text, usage, model, provider: 'copilot' } inside the binding.
      return {
        text: resp?.data?.content ?? '',
        usage: resp?.data?.usage ?? null,
        model,
        provider: 'copilot',
      };
    },

    async embed(request = {}) {
      const { inputs = [], model = DEFAULT_MODEL } = request;
      const client = await getClient();
      const resp = await client.embed({ model, inputs });
      await client.stop?.();
      // Normalize to EmbedResult { vectors, usage, model, provider: 'copilot' }.
      return {
        vectors: resp?.data?.embeddings ?? resp?.vectors ?? [],
        usage: resp?.data?.usage ?? null,
        model,
        provider: 'copilot',
      };
    },
  };
}
