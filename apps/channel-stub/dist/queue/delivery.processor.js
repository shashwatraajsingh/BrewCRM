"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DeliveryProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const axios_1 = __importStar(require("axios"));
let DeliveryProcessor = DeliveryProcessor_1 = class DeliveryProcessor {
    constructor() {
        this.logger = new common_1.Logger(DeliveryProcessor_1.name);
        this.crmApiUrl = process.env['CRM_API_URL'] || 'http://localhost:3000';
    }
    async handleDelivery(job) {
        const { messageId } = job.data;
        try {
            await this.delay(300 + Math.random() * 500);
            if (Math.random() < 0.1) {
                await this.sendReceipt(messageId, 'failed');
                this.logger.debug(`Message ${messageId}: FAILED`);
                return;
            }
            await this.sendReceipt(messageId, 'delivered');
            this.logger.debug(`Message ${messageId}: DELIVERED`);
            await this.delay(2000 + Math.random() * 4000);
            if (Math.random() >= 0.45) {
                return;
            }
            await this.sendReceipt(messageId, 'opened');
            this.logger.debug(`Message ${messageId}: OPENED`);
            await this.delay(1000 + Math.random() * 2000);
            if (Math.random() >= 0.3) {
                return;
            }
            await this.sendReceipt(messageId, 'clicked');
            this.logger.debug(`Message ${messageId}: CLICKED`);
            await this.delay(2000 + Math.random() * 3000);
            if (Math.random() >= 0.2) {
                return;
            }
            await this.sendReceipt(messageId, 'ordered');
            this.logger.debug(`Message ${messageId}: ORDERED`);
        }
        catch (error) {
            this.logger.error(`Delivery simulation failed for message ${messageId}: ${error instanceof Error ? error.message : error}`);
        }
    }
    async sendReceipt(messageId, status, maxRetries = 3) {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                await axios_1.default.post(`${this.crmApiUrl}/receipts`, {
                    messageId,
                    status,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            catch (error) {
                const isLastAttempt = attempt === maxRetries - 1;
                if (isLastAttempt) {
                    this.logger.error(`Failed to send receipt for ${messageId}/${status} after ${maxRetries} attempts: ${error instanceof axios_1.AxiosError ? error.message : error}`);
                    return;
                }
                const backoff = Math.pow(2, attempt) * 1000;
                this.logger.warn(`Receipt callback failed for ${messageId}/${status}, retrying in ${backoff}ms (attempt ${attempt + 1}/${maxRetries})`);
                await this.delay(backoff);
            }
        }
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.DeliveryProcessor = DeliveryProcessor;
__decorate([
    (0, bull_1.Process)({ name: 'simulate-delivery', concurrency: 10 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeliveryProcessor.prototype, "handleDelivery", null);
exports.DeliveryProcessor = DeliveryProcessor = DeliveryProcessor_1 = __decorate([
    (0, bull_1.Processor)('delivery-simulation'),
    __metadata("design:paramtypes", [])
], DeliveryProcessor);
//# sourceMappingURL=delivery.processor.js.map