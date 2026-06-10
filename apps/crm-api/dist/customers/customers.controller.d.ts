import { CustomersService } from './customers.service';
import { SeedService } from '../seed/seed.service';
export declare class CustomersController {
    private readonly customersService;
    private readonly seedService;
    constructor(customersService: CustomersService, seedService: SeedService);
    getStats(): Promise<{
        total: number;
        active: number;
        churned: number;
        at_risk: number;
        avgOrderValue: number;
        avgOrderCount: number;
    }>;
    findAll(status?: string, channel?: string, limit?: string, offset?: string): Promise<{
        data: import("./customer.entity").Customer[];
        total: number;
    }>;
    findOne(id: string): Promise<import("./customer.entity").Customer>;
    seed(): Promise<{
        message: string;
    }>;
}
