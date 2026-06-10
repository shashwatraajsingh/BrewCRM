import { SegmentsService } from '../segments/segments.service';
import { CampaignsService } from '../campaigns/campaigns.service';
export interface ChatResponse {
    response: string;
    toolCalls: string[];
    campaignLaunched?: {
        campaignId: string;
        totalCount: number;
    };
}
export declare class AgentService {
    private readonly segmentsService;
    private readonly campaignsService;
    private readonly logger;
    constructor(segmentsService: SegmentsService, campaignsService: CampaignsService);
    chat(messages: Array<{
        role: string;
        content: string;
    }>, _sessionId: string): Promise<ChatResponse>;
}
