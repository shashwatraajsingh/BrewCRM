import { Campaign } from '../campaigns/campaign.entity';
import { Customer } from '../customers/customer.entity';
export declare class Message {
    id: string;
    campaign: Campaign;
    campaignId: string;
    customer: Customer;
    customerId: string;
    channel: string;
    personalizedText: string;
    status: string;
    sentAt: Date | null;
    deliveredAt: Date | null;
    openedAt: Date | null;
    clickedAt: Date | null;
    orderedAt: Date | null;
    createdAt: Date;
}
