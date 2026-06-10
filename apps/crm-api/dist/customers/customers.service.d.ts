import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
interface FindAllOptions {
    status?: string;
    channel?: string;
    limit?: number;
    offset?: number;
}
export declare class CustomersService {
    private readonly customerRepo;
    constructor(customerRepo: Repository<Customer>);
    findAll(options: FindAllOptions): Promise<{
        data: Customer[];
        total: number;
    }>;
    findOne(id: string): Promise<Customer>;
    getStats(): Promise<{
        total: number;
        active: number;
        churned: number;
        at_risk: number;
        avgOrderValue: number;
        avgOrderCount: number;
    }>;
    count(): Promise<number>;
}
export {};
