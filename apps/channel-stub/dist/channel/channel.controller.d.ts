import { ChannelService } from './channel.service';
declare class SendDto {
    messageId: string;
    recipient: {
        email: string;
        phone: string;
        name: string;
    };
    channel: string;
    text: string;
}
export declare class ChannelController {
    private readonly channelService;
    constructor(channelService: ChannelService);
    send(dto: SendDto): Promise<{
        accepted: boolean;
    }>;
}
export {};
