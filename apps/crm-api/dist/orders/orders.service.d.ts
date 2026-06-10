import { Repository } from 'typeorm';
import { Order } from './order.entity';
export declare class OrdersService {
    private readonly orderRepo;
    constructor(orderRepo: Repository<Order>);
    createMany(orders: Partial<Order>[]): Promise<Order[]>;
    findByCustomer(customerId: string): Promise<Order[]>;
    count(): Promise<number>;
}
