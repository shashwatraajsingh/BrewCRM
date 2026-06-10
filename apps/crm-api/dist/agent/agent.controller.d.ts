import { AgentService } from './agent.service';
declare class ChatDto {
    messages: Array<{
        role: string;
        content: string;
    }>;
    sessionId: string;
}
export declare class AgentController {
    private readonly agentService;
    constructor(agentService: AgentService);
    chat(dto: ChatDto): Promise<import("./agent.service").ChatResponse>;
}
export {};
