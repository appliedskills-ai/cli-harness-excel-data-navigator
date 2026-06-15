// src/providers/offline-provider.mjs
//
// Deterministic offline stub Provider so the CLI and tests work without a live key. It
// implements the full Provider surface returning deterministic ChatResult / EmbedResult.
//
// NOTE (deviation from the literal "zero-vectors" wording in the plan): embeddings are a
// deterministic hashed bag-of-tokens vector rather than literal zero vectors. Zero vectors make
// cosine similarity degenerate (0/NaN) and would make the RAG index/retrieve path impossible to
// verify offline; a deterministic hashed embedding keeps determinism AND lets nearest-neighbor
// retrieval return meaningful, repeatable rankings without any live provider.
const EMBED_DIM = 64;

function hashEmbed(text) {
  const v = new Array(EMBED_DIM).fill(0);
  const tokens = String(text).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  for (const tok of tokens) {
    let h = 2166136261;
    for (let i = 0; i < tok.length; i++) {
      h ^= tok.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    v[(h >>> 0) % EMBED_DIM] += 1;
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}

/** @returns {import('./interface/contract.mjs').Provider} */
export function createOfflineProvider() {
  return {
    get name() {
      return 'offline';
    },
    metered: false,
    capabilities: { chat: true, embed: true },

    async chat() {
      return {
        text: "I don't know — no live model provider is configured (offline stub).",
        usage: null,
        model: 'offline-stub',
        provider: 'offline',
      };
    },

    async embed(request = {}) {
      const { inputs = [] } = request;
      return {
        vectors: inputs.map(hashEmbed),
        usage: null,
        model: 'offline-stub',
        provider: 'offline',
      };
    },
  };
}
