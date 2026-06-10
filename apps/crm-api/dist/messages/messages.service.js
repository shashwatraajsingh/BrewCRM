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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("./message.entity");
let MessagesService = class MessagesService {
    constructor(messageRepo) {
        this.messageRepo = messageRepo;
    }
    async createBulk(messages) {
        const entities = this.messageRepo.create(messages);
        return this.messageRepo.save(entities, { chunk: 100 });
    }
    async findOne(id) {
        const message = await this.messageRepo.findOne({ where: { id } });
        if (!message) {
            throw new common_1.NotFoundException(`Message ${id} not found`);
        }
        return message;
    }
    async findByCampaign(campaignId, pagination) {
        const [messages, total] = await this.messageRepo.findAndCount({
            where: { campaignId },
            relations: ['customer'],
            order: { createdAt: 'ASC' },
            take: pagination.limit,
            skip: pagination.offset,
        });
        return { messages, total };
    }
    async updateStatus(id, status, timestamp) {
        const message = await this.findOne(id);
        message.status = status;
        switch (status) {
            case 'sent':
                message.sentAt = timestamp;
                break;
            case 'delivered':
                message.deliveredAt = timestamp;
                break;
            case 'opened':
                message.openedAt = timestamp;
                break;
            case 'clicked':
                message.clickedAt = timestamp;
                break;
            case 'ordered':
                message.orderedAt = timestamp;
                break;
            case 'failed':
                break;
        }
        return this.messageRepo.save(message);
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MessagesService);
//# sourceMappingURL=messages.service.js.map