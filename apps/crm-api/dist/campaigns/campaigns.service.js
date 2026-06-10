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
var CampaignsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bull_1 = require("@nestjs/bull");
const campaign_entity_1 = require("./campaign.entity");
const segments_service_1 = require("../segments/segments.service");
const messages_service_1 = require("../messages/messages.service");
let CampaignsService = CampaignsService_1 = class CampaignsService {
    constructor(campaignRepo, campaignSendQueue, segmentsService, messagesService) {
        this.campaignRepo = campaignRepo;
        this.campaignSendQueue = campaignSendQueue;
        this.segmentsService = segmentsService;
        this.messagesService = messagesService;
        this.logger = new common_1.Logger(CampaignsService_1.name);
    }
    async findAll() {
        return this.campaignRepo.find({
            relations: ['segment'],
            order: { createdAt: 'DESC' },
        });
    }
    async create(data) {
        const segment = await this.segmentsService.findOne(data.segmentId);
        const campaign = this.campaignRepo.create({
            name: data.name,
            segmentId: data.segmentId,
            channel: data.channel,
            messageTemplate: data.messageTemplate,
            aiPrompt: data.aiPrompt,
            status: 'draft',
            scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        });
        return this.campaignRepo.save(campaign);
    }
    async findOne(id) {
        const campaign = await this.campaignRepo.findOne({
            where: { id },
            relations: ['segment'],
        });
        if (!campaign) {
            throw new common_1.NotFoundException(`Campaign ${id} not found`);
        }
        return campaign;
    }
    async launch(id) {
        const campaign = await this.findOne(id);
        if (campaign.status !== 'draft') {
            throw new common_1.BadRequestException(`Campaign is in '${campaign.status}' state, can only launch 'draft' campaigns`);
        }
        const segment = await this.segmentsService.findOne(campaign.segmentId);
        const customers = await this.segmentsService.resolveCustomers(segment.rules);
        if (customers.length === 0) {
            throw new common_1.BadRequestException('Segment has no matching customers');
        }
        const messages = await this.messagesService.createBulk(customers.map((customer) => ({
            campaignId: campaign.id,
            customerId: customer.id,
            channel: campaign.channel,
            personalizedText: this.personalizeTemplate(campaign.messageTemplate, customer),
            status: 'queued',
        })));
        campaign.status = 'sending';
        campaign.totalCount = customers.length;
        await this.campaignRepo.save(campaign);
        const jobs = messages.map((msg, index) => {
            const customer = customers[index];
            return {
                name: 'send-message',
                data: {
                    messageId: msg.id,
                    campaignId: campaign.id,
                    customerId: customer.id,
                    channel: campaign.channel,
                    personalizedText: msg.personalizedText,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                    customerName: customer.name,
                },
            };
        });
        await this.campaignSendQueue.addBulk(jobs);
        this.logger.log(`Campaign ${campaign.id} launched: ${customers.length} messages queued`);
        return campaign;
    }
    async getMessages(campaignId, pagination) {
        return this.messagesService.findByCampaign(campaignId, pagination);
    }
    personalizeTemplate(template, customer) {
        const daysSinceLastOrder = customer.lastOrderAt
            ? Math.floor((Date.now() - new Date(customer.lastOrderAt).getTime()) /
                (1000 * 60 * 60 * 24))
            : 0;
        return template
            .replace(/\{\{customer\.name\}\}/g, customer.name)
            .replace(/\{\{customer\.totalOrders\}\}/g, String(customer.totalOrders))
            .replace(/\{\{customer\.daysSinceLastOrder\}\}/g, String(daysSinceLastOrder))
            .replace(/\{\{customer\.totalSpent\}\}/g, String(customer.totalSpent));
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = CampaignsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(campaign_entity_1.Campaign)),
    __param(1, (0, bull_1.InjectQueue)('campaign-send')),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object, segments_service_1.SegmentsService,
        messages_service_1.MessagesService])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map