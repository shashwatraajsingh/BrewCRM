import { Segment } from '../segments/segment.entity';
export declare class Campaign {
    id: string;
    name: string;
    segment: Segment;
    segmentId: string;
    channel: string;
    messageTemplate: string;
    status: string;
    totalCount: number;
    sentCount: number;
    deliveredCount: number;
    failedCount: number;
    openedCount: number;
    clickedCount: number;
    ordersCount: number;
    aiPrompt: string;
    scheduledAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
}
