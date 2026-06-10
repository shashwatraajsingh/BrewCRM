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
var ReceiptsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ioredis_1 = __importDefault(require("ioredis"));
const campaign_entity_1 = require("../campaigns/campaign.entity");
const messages_service_1 = require("../messages/messages.service");
let ReceiptsService = ReceiptsService_1 = class ReceiptsService {
    constructor(campaignRepo, messagesService) {
        this.campaignRepo = campaignRepo;
        this.messagesService = messagesService;
        this.logger = new common_1.Logger(ReceiptsService_1.name);
        const redisUrl = process.env['UPSTASH_REDIS_URL'];
        if (redisUrl) {
            this.redis = new ioredis_1.default(redisUrl);
        }
        else {
            this.redis = new ioredis_1.default({
                host: process.env['REDIS_HOST'] || 'localhost',
                port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
            });
        }
    }
    async processReceipt(messageId, status, timestamp, _metadata) {
        const key = `receipt:${messageId}:${status}`;
        const wasSet = await this.redis.set(key, '1', 'EX', 86400, 'NX');
        if (!wasSet) {
            this.logger.debug(`Duplicate receipt ignored: ${key}`);
            return { processed: false };
        }
        try {
            const message = await this.messagesService.updateStatus(messageId, status, timestamp);
            const counterField = this.getCounterField(status);
            if (counterField) {
                await this.campaignRepo.increment({ id: message.campaignId }, counterField, 1);
            }
            await this.checkCampaignCompletion(message.campaignId);
            return { processed: true };
        }
        catch (error) {
            this.logger.error(`Failed to process receipt for message ${messageId}: ${error}`);
            await this.redis.del(key);
            throw error;
        }
    }
    getCounterField(status) {
        switch (status) {
            case 'delivered':
                return 'deliveredCount';
            case 'failed':
                return 'failedCount';
            case 'opened':
                return 'openedCount';
            case 'clicked':
                return 'clickedCount';
            case 'ordered':
                return 'ordersCount';
            default:
                return null;
        }
    }
    async checkCampaignCompletion(campaignId) {
        const campaign = await this.campaignRepo.findOne({
            where: { id: campaignId },
        });
        if (!campaign || campaign.status !== 'sending') {
            return;
        }
        if (campaign.deliveredCount + campaign.failedCount >= campaign.totalCount &&
            campaign.totalCount > 0) {
            campaign.status = 'completed';
            campaign.completedAt = new Date();
            await this.campaignRepo.save(campaign);
            this.logger.log(`Campaign ${campaignId} completed`);
        }
    }
};
exports.ReceiptsService = ReceiptsService;
exports.ReceiptsService = ReceiptsService = ReceiptsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(campaign_entity_1.Campaign)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        messages_service_1.MessagesService])
], ReceiptsService);
//# sourceMappingURL=receipts.service.js.map