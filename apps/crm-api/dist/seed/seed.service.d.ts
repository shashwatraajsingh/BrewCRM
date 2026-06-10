import { Repository } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { Order } from '../orders/order.entity';
import { Segment } from '../segments/segment.entity';
export declare class SeedService {
    private readonly customerRepo;
    private readonly orderRepo;
    private readonly segmentRepo;
    private readonly logger;
    constructor(customerRepo: Repository<Customer>, orderRepo: Repository<Order>, segmentRepo: Repository<Segment>);
    seed(): Promise<void>;
    private generateCustomers;
    private generateOrders;
    private updateCustomerAggregates;
    private createSegments;
}
