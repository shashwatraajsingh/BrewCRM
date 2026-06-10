import { Job } from 'bull';
import { Repository } from 'typeorm';
import { Campaign } from '../campaigns/campaign.entity';
import { MessagesService } from '../messages/messages.service';
interface SendMessagePayload {
    messageId: string;
    campaignId: string;
    customerId: string;
    channel: string;
    personalizedText: string;
    customerEmail: string;
    customerPhone: string;
    customerName: string;
}
export declare class CampaignSendProcessor {
    private readonly campaignRepo;
    private readonly messagesService;
    private readonly logger;
    private readonly channelStubUrl;
    constructor(campaignRepo: Repository<Campaign>, messagesService: MessagesService);
    handleSendMessage(job: Job<SendMessagePayload>): Promise<void>;
}
export {};
