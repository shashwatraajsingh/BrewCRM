import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { Campaign } from './campaign.entity';
import { SegmentsService } from '../segments/segments.service';
import { MessagesService } from '../messages/messages.service';
export declare class CampaignsService {
    private readonly campaignRepo;
    private readonly campaignSendQueue;
    private readonly segmentsService;
    private readonly messagesService;
    private readonly logger;
    constructor(campaignRepo: Repository<Campaign>, campaignSendQueue: Queue, segmentsService: SegmentsService, messagesService: MessagesService);
    findAll(): Promise<Campaign[]>;
    create(data: {
        name: string;
        segmentId: string;
        channel: string;
        messageTemplate: string;
        aiPrompt?: string;
        scheduledAt?: string;
    }): Promise<Campaign>;
    findOne(id: string): Promise<Campaign>;
    launch(id: string): Promise<Campaign>;
    getMessages(campaignId: string, pagination: {
        limit: number;
        offset: number;
    }): Promise<{
        messages: import("../messages/message.entity").Message[];
        total: number;
    }>;
    private personalizeTemplate;
}
