"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLaunchCampaignTool = createLaunchCampaignTool;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
function createLaunchCampaignTool(campaignsService) {
    const launchSchema = zod_1.z.object({
        name: zod_1.z.string().describe('Campaign name'),
        segmentId: zod_1.z.string().describe('Target segment ID — must be the exact UUID returned by build_segment'),
        channel: zod_1.z
            .string()
            .describe('Delivery channel (lowercase): email, whatsapp, sms, or rcs'),
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
        try {
            const channel = input.channel.toLowerCase();
            const campaign = await campaignsService.create({
                name: input.name,
                segmentId: input.segmentId,
                channel,
                messageTemplate: input.messageTemplate,
                aiPrompt: input.aiPrompt || undefined,
            });
            const launched = await campaignsService.launch(campaign.id);
            return JSON.stringify({
                campaignId: launched.id,
                status: launched.status,
                totalCount: launched.totalCount,
                message: `Campaign "${launched.name}" launched successfully! ${launched.totalCount} messages are being sent via ${launched.channel}.`,
            });
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            return JSON.stringify({
                error: true,
                message: `Failed to launch campaign: ${errorMessage}`,
                suggestion: 'Please check that the segmentId is valid and try again.',
            });
        }
    }, {
        name: 'launch_campaign',
        description: 'Create and launch a campaign. ONLY call this after the user has explicitly confirmed they want to send.\nThe segmentId MUST be the exact UUID value returned by build_segment.\nThe channel must be lowercase (email, whatsapp, sms, or rcs).\nDo not generate or modify the segmentId.',
        schema: launchSchema,
    });
}
//# sourceMappingURL=launch-campaign.tool.js.map