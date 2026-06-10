import { Campaign } from '../campaigns/campaign.entity';
export interface SegmentRule {
    field: string;
    operator: string;
    value: string | number | string[] | number[];
}
export declare class Segment {
    id: string;
    name: string;
    description: string;
    rules: SegmentRule[];
    customerCount: number;
    createdBy: string;
    createdAt: Date;
    campaigns: Campaign[];
}
