import { CampaignsService } from './campaigns.service';
declare class CreateCampaignDto {
    name: string;
    segmentId: string;
    channel: string;
    messageTemplate: string;
    aiPrompt?: string;
    scheduledAt?: string;
}
export declare class CampaignsController {
    private readonly campaignsService;
    constructor(campaignsService: CampaignsService);
    findAll(): Promise<import("./campaign.entity").Campaign[]>;
    create(dto: CreateCampaignDto): Promise<import("./campaign.entity").Campaign>;
    findOne(id: string): Promise<import("./campaign.entity").Campaign>;
    launch(id: string): Promise<import("./campaign.entity").Campaign>;
    getMessages(id: string, limit?: string, offset?: string): Promise<{
        messages: import("../messages/message.entity").Message[];
        total: number;
    }>;
}
export {};
