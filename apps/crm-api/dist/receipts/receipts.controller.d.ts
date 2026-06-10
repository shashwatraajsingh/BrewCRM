import { ReceiptsService } from './receipts.service';
declare class ReceiptDto {
    messageId: string;
    status: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}
export declare class ReceiptsController {
    private readonly receiptsService;
    constructor(receiptsService: ReceiptsService);
    receive(dto: ReceiptDto): Promise<{
        processed: boolean;
    }>;
}
export {};
