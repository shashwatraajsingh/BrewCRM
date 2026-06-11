import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { CampaignsService } from '../../campaigns/campaigns.service';

export function createLaunchCampaignTool(campaignsService: CampaignsService) {
  const launchSchema = z.object({
    name: z.string().describe('Campaign name'),
    segmentId: z.string().describe('Target segment ID'),
    channel: z.string().describe('Delivery channel: email, whatsapp, sms, or rcs'),
    messageTemplate: z
      .string()
      .describe('Message template with {{customer.*}} variables'),
    aiPrompt: z
      .string()
      .optional()
      .nullable()
      .describe('Original natural language prompt that created this campaign'),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tool as any)(
    async (input: z.infer<typeof launchSchema>) => {
      require('fs').appendFileSync('launch-debug.log', JSON.stringify({ event: 'INPUT', input }) + '\n');
      try {
        // Create the campaign
        const campaign = await campaignsService.create({
          name: input.name,
          segmentId: input.segmentId,
          channel: input.channel,
          messageTemplate: input.messageTemplate,
          aiPrompt: input.aiPrompt || undefined,
        });

        // Launch it
        const launched = await campaignsService.launch(campaign.id);
        
        const result = JSON.stringify({
          campaignId: launched.id,
          status: launched.status,
          totalCount: launched.totalCount,
          message: `Campaign "${launched.name}" launched successfully! ${launched.totalCount} messages are being sent via ${launched.channel}.`,
        });
        require('fs').appendFileSync('launch-debug.log', JSON.stringify({ event: 'SUCCESS', result }) + '\n');
        return result;
      } catch (err: any) {
        require('fs').appendFileSync('launch-debug.log', JSON.stringify({ event: 'ERROR', error: err.message, stack: err.stack }) + '\n');
        throw err;
      }
    },
    {
      name: 'launch_campaign',
      description:
        'Create and launch a campaign. ONLY call this after the user has explicitly confirmed they want to send.\nThe segmentId MUST come from the exact value returned by build_segment tool.\nDo not generate or modify it.',
      schema: launchSchema,
    },
  );
}
