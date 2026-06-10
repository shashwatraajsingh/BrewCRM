import { Customer } from '../customers/customer.entity';
export declare class Order {
    id: string;
    customer: Customer;
    customerId: string;
    amount: number;
    status: string;
    productCategory: string;
    items: Record<string, unknown>[] | null;
    orderedAt: Date;
}
