import { Queue } from 'bull';
interface SendPayload {
    messageId: string;
    recipient: {
        email: string;
        phone: string;
        name: string;
    };
    channel: string;
    text: string;
}
export declare class ChannelService {
    private readonly deliveryQueue;
    private readonly logger;
    constructor(deliveryQueue: Queue);
    enqueueSend(payload: SendPayload): Promise<void>;
}
export {};
