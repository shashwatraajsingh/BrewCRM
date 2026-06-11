"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLaunchCampaignTool = createLaunchCampaignTool;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
function createLaunchCampaignTool(campaignsService) {
    const launchSchema = zod_1.z.object({
        name: zod_1.z.string().describe('Campaign name'),
        segmentId: zod_1.z.string().describe('Target segment ID'),
        channel: zod_1.z.string().describe('Delivery channel: email, whatsapp, sms, or rcs'),
        messageTemplate: zod_1.z
            .string()
            .describe('Message template with {{customer.*}} variables'),
        aiPrompt: zod_1.z
            .string()
            .optional()
            .nullable()
            .describe('Original natural language prompt that created this campaign'),
    });
    return tools_1.tool(async (input) => {
        require('fs').appendFileSync('launch-debug.log', JSON.stringify({ event: 'INPUT', input }) + '\n');
        try {
            const campaign = await campaignsService.create({
                name: input.name,
                segmentId: input.segmentId,
                channel: input.channel,
                messageTemplate: input.messageTemplate,
                aiPrompt: input.aiPrompt || undefined,
            });
            const launched = await campaignsService.launch(campaign.id);
            const result = JSON.stringify({
                campaignId: launched.id,
                status: launched.status,
                totalCount: launched.totalCount,
                message: `Campaign "${launched.name}" launched successfully! ${launched.totalCount} messages are being sent via ${launched.channel}.`,
            });
            require('fs').appendFileSync('launch-debug.log', JSON.stringify({ event: 'SUCCESS', result }) + '\n');
            return result;
        }
        catch (err) {
            require('fs').appendFileSync('launch-debug.log', JSON.stringify({ event: 'ERROR', error: err.message, stack: err.stack }) + '\n');
            throw err;
        }
    }, {
        name: 'launch_campaign',
        description: 'Create and launch a campaign. ONLY call this after the user has explicitly confirmed they want to send.\nThe segmentId MUST come from the exact value returned by build_segment tool.\nDo not generate or modify it.',
        schema: launchSchema,
    });
}
//# sourceMappingURL=launch-campaign.tool.js.map