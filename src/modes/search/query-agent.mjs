// src/modes/search/query-agent.mjs
//
// The NL query agent: exposes the Epic-03 tools to provider.chat() so the MODEL chooses how to
// answer (SQL, aggregation, or RAG) — there is no hardcoded keyword routing. answerQuestion wraps
// the router in a bounded multi-step loop, executes each selected tool, feeds the grounded result
// back, and stops at the iteration cap with a grounded (possibly abstaining) answer.
import { env } from '../../config/env.mjs';
import { sqlTool, runSqlTool } from '../../agent/tools/sql.mjs';
import { aggregateTool, aggregate } from '../../agent/tools/aggregate.mjs';
import { ragTool, ragSearch } from '../../agent/tools/rag.mjs';
import { GROUNDING_SYSTEM_PROMPT, buildGroundedAnswer } from '../../agent/grounding.mjs';
import { selectProvider } from '../../providers/interface/selector.mjs';
import { appendLine } from '../../store/jsonl-log.mjs';

export const MAX_TOOL_ITERATIONS = Number(env.MAX_TOOL_ITERATIONS ?? 6);

/** Tool-use definitions for provider.chat(), seeded with the dataset's grounding context. */
export function buildToolDefinitions(dataset) {
  const grounding = { table: dataset?.tableName, columns: dataset?.columnDefs };
  return [
    { name: sqlTool.name, description: 'Generate + run a read-only SELECT over the dataset.', parameters: sqlTool.params, grounding },
    { name: aggregateTool.name, description: 'Compute a column statistic (count/sum/avg/min/max/distinct/missing).', parameters: aggregateTool.params, grounding },
    { name: ragTool.name, description: 'Semantic retrieval of grounded rows by natural-language query.', parameters: ragTool.params, grounding },
  ];
}

const datasetId = (dataset) => (typeof dataset === 'string' ? dataset : dataset?.name);

async function execTool(call, dataset) {
  const id = datasetId(dataset);
  switch (call.name) {
    case sqlTool.name: return runSqlTool({ datasetId: id, question: call.args?.question });
    case aggregateTool.name: return aggregate({ datasetId: id, column: call.args?.column, op: call.args?.op });
    case ragTool.name: return ragSearch({ datasetId: id, query: call.args?.query, k: call.args?.k });
    default: throw new Error(`Unknown tool: ${call.name}`);
  }
}

/**
 * Ask the model for its first tool-call decision (or a direct answer). The selection is the
 * model's, returned in the ChatResult tool-call payload — no keyword matching here.
 */
export async function routeQuestion({ question, dataset, provider = selectProvider(), sessionId }) {
  const tools = buildToolDefinitions(dataset);
  const res = await provider.chat({
    system: GROUNDING_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: question }],
    tools,
  });
  if (sessionId) appendLine(sessionId, { type: 'route', question }, { toolCalls: res.toolCalls ?? null, text: res.text });
  const call = res.toolCalls?.[0];
  return call ? { toolCall: call } : { answer: res.text };
}

/**
 * Bounded multi-step orchestration. Executes each model-selected tool, feeds results back, and
 * returns a grounded answer (or the abstain answer) — never spins forever.
 */
export async function answerQuestion({ question, dataset, provider = selectProvider(), sessionId }) {
  const tools = buildToolDefinitions(dataset);
  const messages = [{ role: 'user', content: question }];
  const toolResults = [];

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const res = await provider.chat({ system: GROUNDING_SYSTEM_PROMPT, messages, tools });
    const call = res.toolCalls?.[0];
    if (!call) {
      // model emitted a final answer — ground it with whatever evidence was gathered
      return buildGroundedAnswer({ answerText: res.text, toolResults, question });
    }
    let result;
    try {
      result = await execTool(call, dataset);
    } catch (err) {
      result = { error: String(err?.message ?? err) };
    }
    toolResults.push(result);
    messages.push({ role: 'assistant', content: `tool:${call.name}` });
    messages.push({ role: 'user', content: `tool_result: ${JSON.stringify(result).slice(0, 2000)}` });
    if (sessionId) appendLine(sessionId, { type: 'tool', name: call.name, args: call.args }, { result });
  }
  // hit the cap — return the best grounded partial / abstain answer rather than looping further
  return buildGroundedAnswer({
    answerText: "I don't know — reached the tool-iteration cap without a confident answer.",
    toolResults,
    question,
  });
}
