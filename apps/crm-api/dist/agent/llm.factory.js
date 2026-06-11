"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLLM = createLLM;
const openai_1 = require("@langchain/openai");
const anthropic_1 = require("@langchain/anthropic");
const google_genai_1 = require("@langchain/google-genai");
function createLLM() {
    const provider = process.env['LLM_PROVIDER'] || 'openrouter';
    if (provider === 'gemini') {
        return new google_genai_1.ChatGoogleGenerativeAI({
            model: process.env['GEMINI_MODEL'] || 'gemini-2.5-flash',
            apiKey: process.env['GEMINI_API_KEY'],
        });
    }
    if (provider === 'anthropic') {
        return new anthropic_1.ChatAnthropic({
            model: 'claude-haiku-4-5',
            apiKey: process.env['ANTHROPIC_API_KEY'],
        });
    }
    return new openai_1.ChatOpenAI({
        modelName: process.env['OPENROUTER_MODEL'] || 'meta-llama/llama-3.3-70b-instruct:free',
        openAIApiKey: process.env['OPENROUTER_API_KEY'],
        configuration: {
            baseURL: 'https://openrouter.ai/api/v1',
        },
    });
}
//# sourceMappingURL=llm.factory.js.map