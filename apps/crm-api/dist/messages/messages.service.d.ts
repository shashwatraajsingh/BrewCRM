import { Repository } from 'typeorm';
import { Message } from './message.entity';
export declare class MessagesService {
    private readonly messageRepo;
    constructor(messageRepo: Repository<Message>);
    createBulk(messages: Partial<Message>[]): Promise<Message[]>;
    findOne(id: string): Promise<Message>;
    findByCampaign(campaignId: string, pagination: {
        limit: number;
        offset: number;
    }): Promise<{
        messages: Message[];
        total: number;
    }>;
    updateStatus(id: string, status: string, timestamp: Date): Promise<Message>;
}
