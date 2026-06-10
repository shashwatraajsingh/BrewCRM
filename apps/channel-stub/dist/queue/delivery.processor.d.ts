import { Job } from 'bull';
interface DeliveryPayload {
    messageId: string;
    recipient: {
        email: string;
        phone: string;
        name: string;
    };
    channel: string;
    text: string;
}
export declare class DeliveryProcessor {
    private readonly logger;
    private readonly crmApiUrl;
    constructor();
    handleDelivery(job: Job<DeliveryPayload>): Promise<void>;
    private sendReceipt;
    private delay;
}
export {};
