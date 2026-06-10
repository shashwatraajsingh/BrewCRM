import { Repository } from 'typeorm';
import { Campaign } from '../campaigns/campaign.entity';
import { MessagesService } from '../messages/messages.service';
export declare class ReceiptsService {
    private readonly campaignRepo;
    private readonly messagesService;
    private readonly logger;
    private readonly redis;
    constructor(campaignRepo: Repository<Campaign>, messagesService: MessagesService);
    processReceipt(messageId: string, status: string, timestamp: Date, _metadata?: Record<string, unknown>): Promise<{
        processed: boolean;
    }>;
    private getCounterField;
    private checkCampaignCompletion;
}
