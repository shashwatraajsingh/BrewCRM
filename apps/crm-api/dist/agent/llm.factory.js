"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLLM = createLLM;
const openai_1 = require("@langchain/openai");
const anthropic_1 = require("@langchain/anthropic");
function createLLM() {
    const provider = process.env['LLM_PROVIDER'] || 'openrouter';
    if (provider === 'anthropic') {
        return new anthropic_1.ChatAnthropic({
            model: 'claude-haiku-4-5',
            apiKey: process.env['ANTHROPIC_API_KEY'],
        });
    }
    return new openai_1.ChatOpenAI({
        modelName: process.env['OPENROUTER_MODEL'] || 'deepseek/deepseek-chat:free',
        openAIApiKey: process.env['OPENROUTER_API_KEY'],
        configuration: {
            baseURL: 'https://openrouter.ai/api/v1',
        },
    });
}
//# sourceMappingURL=llm.factory.js.map