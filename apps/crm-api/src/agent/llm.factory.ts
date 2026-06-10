import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createLLM(): any {
  const provider = process.env['LLM_PROVIDER'] || 'openrouter';

  if (provider === 'anthropic') {
    return new ChatAnthropic({
      model: 'claude-haiku-4-5',
      apiKey: process.env['ANTHROPIC_API_KEY'],
    });
  }

  // Default: OpenRouter (uses OpenAI-compatible API)
  return new ChatOpenAI({
    modelName: process.env['OPENROUTER_MODEL'] || 'deepseek/deepseek-chat:free',
    openAIApiKey: process.env['OPENROUTER_API_KEY'],
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
    },
  } as Record<string, unknown>);
}
