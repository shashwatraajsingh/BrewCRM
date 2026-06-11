"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const langgraph_1 = require("@langchain/langgraph");
const prebuilt_1 = require("@langchain/langgraph/prebuilt");
const messages_1 = require("@langchain/core/messages");
const llm_factory_1 = require("./llm.factory");
const query_customers_tool_1 = require("./tools/query-customers.tool");
const build_segment_tool_1 = require("./tools/build-segment.tool");
const draft_message_tool_1 = require("./tools/draft-message.tool");
const estimate_reach_tool_1 = require("./tools/estimate-reach.tool");
const launch_campaign_tool_1 = require("./tools/launch-campaign.tool");
const segments_service_1 = require("../segments/segments.service");
const campaigns_service_1 = require("../campaigns/campaigns.service");
const SYSTEM_PROMPT = `You are BrewCRM's campaign co-pilot for Roast & Co., a coffee chain.
You help marketers run targeted campaigns by understanding their intent, finding the right customers, drafting messages, and launching campaigns.

## CRITICAL RULES

1. **ALWAYS use tools to answer data questions.** Never say "I can't" or "I don't have access". You have full access to the customer database via query_customers. Use it.
2. **Honor the user's requested count.** If they ask for "top 5", set limit=5. If they ask for "top 10", set limit=10.
3. **Always include customer details in your response.** When showing customers, ALWAYS list their name, email, total orders, total spent, and preferred channel. Format as a numbered list with bold names.
4. **Use sortBy to get top/bottom customers.** For "most loyal" or "top buyers", use sortBy="totalOrders" or sortBy="totalSpent" with sortOrder="desc".
5. **Channel ≠ preferredChannel filter.** When the user says "send them an email" or "send a WhatsApp message", that is the DELIVERY CHANNEL — it does NOT mean you should filter the segment by preferredChannel. Include ALL customers from the context in the segment, regardless of their preferred channel. Only filter by preferredChannel if the user explicitly asks to (e.g., "only customers who prefer email").
6. **Use context from previous messages.** If the user previously asked for "top 5 customers" and then says "send them a mail", build the segment to include ALL 5 of those customers — not a filtered subset.

## Campaign Workflow
1. Understand the marketer's goal
2. Use query_customers to explore the data (with appropriate filters, sorting, and limit)
3. Use build_segment to create the audience
4. Use draft_message to write personalized copy
5. Use estimate_reach to show expected performance
6. Present a clear campaign plan and ASK FOR CONFIRMATION before launching
7. Only after explicit user confirmation (e.g., "yes", "go ahead", "launch it"), use launch_campaign

## launch_campaign Rules
- CRITICAL: The segmentId MUST be the EXACT value returned by build_segment. Copy it character-for-character.
- The channel must be lowercase: email, whatsapp, sms, or rcs
- Never launch without explicit user confirmation
- If launch_campaign fails, tell the user the error clearly and ask how to proceed

## Formatting
- Format data as numbered lists or tables
- Bold customer names
- Use bullet points for campaign summaries
- Keep responses concise but complete

Available channels: email, whatsapp, sms, rcs
Current brand: Roast & Co. (specialty coffee chain)
Tone: warm, human, not salesy. Short messages. First name basis.`;
const AgentState = langgraph_1.Annotation.Root({
    messages: (0, langgraph_1.Annotation)({
        reducer: (x, y) => x.concat(y),
    }),
});
let AgentService = AgentService_1 = class AgentService {
    constructor(segmentsService, campaignsService) {
        this.segmentsService = segmentsService;
        this.campaignsService = campaignsService;
        this.logger = new common_1.Logger(AgentService_1.name);
    }
    async chat(messages, _sessionId) {
        const tools = [
            (0, query_customers_tool_1.createQueryCustomersTool)(this.segmentsService),
            (0, build_segment_tool_1.createBuildSegmentTool)(this.segmentsService),
            (0, draft_message_tool_1.createDraftMessageTool)(),
            (0, estimate_reach_tool_1.createEstimateReachTool)(this.segmentsService),
            (0, launch_campaign_tool_1.createLaunchCampaignTool)(this.campaignsService),
        ];
        const llm = (0, llm_factory_1.createLLM)();
        const llmWithTools = llm.bindTools(tools);
        const agentNode = async (state) => {
            const response = await llmWithTools.invoke(state.messages);
            return { messages: [response] };
        };
        const toolNode = new prebuilt_1.ToolNode(tools);
        const shouldContinue = (state) => {
            const lastMessage = state.messages[state.messages.length - 1];
            if (lastMessage &&
                'tool_calls' in lastMessage &&
                Array.isArray(lastMessage.tool_calls) &&
                lastMessage.tool_calls.length > 0) {
                return 'tools';
            }
            return langgraph_1.END;
        };
        const graph = new langgraph_1.StateGraph(AgentState)
            .addNode('agent', agentNode)
            .addNode('tools', toolNode)
            .addEdge(langgraph_1.START, 'agent')
            .addConditionalEdges('agent', shouldContinue)
            .addEdge('tools', 'agent')
            .compile();
        const langchainMessages = [
            new messages_1.SystemMessage(SYSTEM_PROMPT),
            ...messages.map((m) => {
                if (m.role === 'user')
                    return new messages_1.HumanMessage(m.content);
                return new messages_1.AIMessage(m.content);
            }),
        ];
        const result = await graph.invoke({
            messages: langchainMessages,
        });
        const allMessages = result.messages;
        const toolCalls = [];
        let campaignLaunched;
        for (const msg of allMessages) {
            if (msg instanceof messages_1.AIMessage &&
                msg.tool_calls &&
                msg.tool_calls.length > 0) {
                for (const tc of msg.tool_calls) {
                    toolCalls.push(tc.name);
                    if (tc.name === 'launch_campaign') {
                        const toolResponseIndex = allMessages.indexOf(msg) + 1;
                        if (toolResponseIndex < allMessages.length) {
                            try {
                                const toolResponse = allMessages[toolResponseIndex];
                                const content = typeof toolResponse.content === 'string'
                                    ? toolResponse.content
                                    : JSON.stringify(toolResponse.content);
                                const parsed = JSON.parse(content);
                                if (parsed.campaignId) {
                                    campaignLaunched = {
                                        campaignId: parsed.campaignId,
                                        totalCount: parsed.totalCount,
                                    };
                                }
                            }
                            catch {
                            }
                        }
                    }
                }
            }
        }
        let response = '';
        for (let i = allMessages.length - 1; i >= 0; i--) {
            const msg = allMessages[i];
            if (msg instanceof messages_1.AIMessage && (!msg.tool_calls || msg.tool_calls.length === 0)) {
                response =
                    typeof msg.content === 'string'
                        ? msg.content
                        : JSON.stringify(msg.content);
                break;
            }
        }
        return {
            response,
            toolCalls: [...new Set(toolCalls)],
            campaignLaunched,
        };
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = AgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [segments_service_1.SegmentsService,
        campaigns_service_1.CampaignsService])
], AgentService);
//# sourceMappingURL=agent.service.js.map