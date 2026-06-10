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

Your workflow:
1. Understand the marketer's goal
2. Use query_customers to explore the data
3. Use build_segment to create the audience
4. Use draft_message to write personalized copy
5. Use estimate_reach to show expected performance
6. Present a clear campaign plan and ASK FOR CONFIRMATION before launching
7. Only after explicit confirmation, use launch_campaign

Available channels: email, whatsapp, sms, rcs
Current brand: Roast & Co. (specialty coffee chain)
Tone: warm, human, not salesy. Short messages. First name basis.

Never launch a campaign without explicit user confirmation.
CRITICAL: When build_segment returns a segmentId, store it exactly as returned and pass it directly to launch_campaign. Never modify, guess, or regenerate the segmentId.
When presenting data, format it nicely with bullet points and numbers.
When showing a campaign plan, present it as a clear summary with segment, message preview, channel, and estimated reach.`;
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