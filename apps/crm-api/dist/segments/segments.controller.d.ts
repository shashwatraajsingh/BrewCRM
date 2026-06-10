import { SegmentsService } from './segments.service';
import { SegmentRule } from './segment.entity';
declare class CreateSegmentDto {
    name: string;
    description?: string;
    rules: SegmentRule[];
    createdBy?: string;
}
export declare class SegmentsController {
    private readonly segmentsService;
    constructor(segmentsService: SegmentsService);
    findAll(): Promise<import("./segment.entity").Segment[]>;
    create(dto: CreateSegmentDto): Promise<import("./segment.entity").Segment>;
    findOne(id: string, limit?: string, offset?: string): Promise<{
        segment: import("./segment.entity").Segment;
        customers: import("../customers/customer.entity").Customer[];
        total: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
    refresh(id: string): Promise<import("./segment.entity").Segment>;
}
export {};
