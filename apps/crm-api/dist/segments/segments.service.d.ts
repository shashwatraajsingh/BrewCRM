import { Repository } from 'typeorm';
import { Segment, SegmentRule } from './segment.entity';
import { Customer } from '../customers/customer.entity';
export declare class SegmentsService {
    private readonly segmentRepo;
    private readonly customerRepo;
    constructor(segmentRepo: Repository<Segment>, customerRepo: Repository<Customer>);
    findAll(): Promise<Segment[]>;
    create(data: {
        name: string;
        description?: string;
        rules: SegmentRule[];
        createdBy?: string;
    }): Promise<Segment>;
    findOneWithCustomers(id: string, pagination: {
        limit: number;
        offset: number;
    }): Promise<{
        segment: Segment;
        customers: Customer[];
        total: number;
    }>;
    findOne(id: string): Promise<Segment>;
    remove(id: string): Promise<void>;
    refreshCount(id: string): Promise<Segment>;
    resolveCustomers(rules: SegmentRule[]): Promise<Customer[]>;
    private applyRule;
}
