"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CampaignSendProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignSendProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = __importDefault(require("axios"));
const campaign_entity_1 = require("../campaigns/campaign.entity");
const messages_service_1 = require("../messages/messages.service");
let CampaignSendProcessor = CampaignSendProcessor_1 = class CampaignSendProcessor {
    constructor(campaignRepo, messagesService) {
        this.campaignRepo = campaignRepo;
        this.messagesService = messagesService;
        this.logger = new common_1.Logger(CampaignSendProcessor_1.name);
        this.channelStubUrl =
            process.env['CHANNEL_STUB_URL'] || 'http://localhost:3001';
    }
    async handleSendMessage(job) {
        const { messageId, campaignId, channel, personalizedText, customerEmail, customerPhone, customerName } = job.data;
        try {
            await axios_1.default.post(`${this.channelStubUrl}/send`, {
                messageId,
                recipient: {
                    email: customerEmail,
                    phone: customerPhone,
                    name: customerName,
                },
                channel,
                text: personalizedText,
            });
            await this.messagesService.updateStatus(messageId, 'sent', new Date());
            await this.campaignRepo.increment({ id: campaignId }, 'sentCount', 1);
            this.logger.debug(`Message ${messageId} sent successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to send message ${messageId}: ${error instanceof Error ? error.message : error}`);
        }
    }
};
exports.CampaignSendProcessor = CampaignSendProcessor;
__decorate([
    (0, bull_1.Process)({ name: 'send-message', concurrency: 5 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CampaignSendProcessor.prototype, "handleSendMessage", null);
exports.CampaignSendProcessor = CampaignSendProcessor = CampaignSendProcessor_1 = __decorate([
    (0, bull_1.Processor)('campaign-send'),
    __param(0, (0, typeorm_1.InjectRepository)(campaign_entity_1.Campaign)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        messages_service_1.MessagesService])
], CampaignSendProcessor);
//# sourceMappingURL=campaign-send.processor.js.map