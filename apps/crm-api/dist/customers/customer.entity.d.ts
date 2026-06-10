import { Order } from '../orders/order.entity';
export declare class Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    preferredChannel: string;
    status: string;
    totalSpent: number;
    totalOrders: number;
    lastOrderAt: Date | null;
    firstOrderAt: Date | null;
    tags: string[];
    createdAt: Date;
    orders: Order[];
}
