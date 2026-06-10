"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDraftMessageTool = createDraftMessageTool;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const llm_factory_1 = require("../llm.factory");
const messages_1 = require("@langchain/core/messages");
function createDraftMessageTool() {
    const draftSchema = zod_1.z.object({
        intent: zod_1.z.string().describe('The marketing intent or goal (e.g., "win back lapsed customers")'),
        channel: zod_1.z
            .string()
            .describe('Delivery channel: email, whatsapp, sms, or rcs'),
        segmentDescription: zod_1.z
            .string()
            .describe('Description of the target customer segment'),
        tone: zod_1.z
            .string()
            .optional()
            .describe('Desired tone (default: warm, human, not salesy)'),
        sampleCustomers: zod_1.z
            .array(zod_1.z.object({
            name: zod_1.z.string(),
            totalOrders: zod_1.z.number(),
            daysSinceLastOrder: zod_1.z.number(),
            totalSpent: zod_1.z.number(),
        }))
            .describe('Sample customers for generating preview messages'),
    });
    return tools_1.tool(async (input) => {
        const llm = (0, llm_factory_1.createLLM)();
        const prompt = `You are a marketing copywriter for a coffee chain called Roast & Co.
Write a personalized message template using these variables:
- {{customer.name}} — the customer's first name
- {{customer.totalOrders}} — how many orders they've placed
- {{customer.daysSinceLastOrder}} — days since their last order
- {{customer.totalSpent}} — total amount spent

Channel: ${input.channel}
Intent: ${input.intent}
Segment: ${input.segmentDescription}
Tone: ${input.tone || 'warm, human, not salesy'}

Keep it short and conversational. First name basis.
${input.channel === 'whatsapp' || input.channel === 'sms' ? 'Keep under 160 characters.' : ''}

Now generate personalized previews using these sample customers:
${input.sampleCustomers.map((c) => `- ${c.name}: ${c.totalOrders} orders, ${c.daysSinceLastOrder} days ago, ₹${c.totalSpent} spent`).join('\n')}

Return a valid JSON object (no markdown, no code fences) with this exact structure:
{
  "template": "the message template with {{customer.*}} variables",
  "previews": [{"customerName": "Name", "message": "personalized message"}]
}`;
        const response = await llm.invoke([new messages_1.HumanMessage(prompt)]);
        const content = typeof response.content === 'string'
            ? response.content
            : JSON.stringify(response.content);
        try {
            const cleaned = content.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim();
            const parsed = JSON.parse(cleaned);
            return JSON.stringify(parsed);
        }
        catch {
            return JSON.stringify({
                template: content,
                previews: [],
            });
        }
    }, {
        name: 'draft_message',
        description: 'Draft a personalized message template for a campaign. Returns the template with sample personalized previews.',
        schema: draftSchema,
    });
}
//# sourceMappingURL=draft-message.tool.js.map