"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const customers_module_1 = require("./customers/customers.module");
const orders_module_1 = require("./orders/orders.module");
const segments_module_1 = require("./segments/segments.module");
const campaigns_module_1 = require("./campaigns/campaigns.module");
const messages_module_1 = require("./messages/messages.module");
const receipts_module_1 = require("./receipts/receipts.module");
const agent_module_1 = require("./agent/agent.module");
const queue_module_1 = require("./queue/queue.module");
const seed_module_1 = require("./seed/seed.module");
const customer_entity_1 = require("./customers/customer.entity");
const order_entity_1 = require("./orders/order.entity");
const segment_entity_1 = require("./segments/segment.entity");
const campaign_entity_1 = require("./campaigns/campaign.entity");
const message_entity_1 = require("./messages/message.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    ...(config.get('DATABASE_URL')
                        ? {
                            url: config.get('DATABASE_URL'),
                            ssl: { rejectUnauthorized: false }
                        }
                        : {
                            host: config.get('DB_HOST', 'localhost'),
                            port: config.get('DB_PORT', 5432),
                            username: config.get('DB_USER', 'postgres'),
                            password: config.get('DB_PASS', 'postgres'),
                            database: config.get('DB_NAME', 'brewcrm'),
                        }),
                    entities: [customer_entity_1.Customer, order_entity_1.Order, segment_entity_1.Segment, campaign_entity_1.Campaign, message_entity_1.Message],
                    synchronize: true,
                    logging: false,
                }),
            }),
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const redisUrl = config.get('UPSTASH_REDIS_URL');
                    if (redisUrl) {
                        return { redis: redisUrl };
                    }
                    return {
                        redis: {
                            host: config.get('REDIS_HOST', 'localhost'),
                            port: config.get('REDIS_PORT', 6379),
                        },
                    };
                },
            }),
            customers_module_1.CustomersModule,
            orders_module_1.OrdersModule,
            segments_module_1.SegmentsModule,
            campaigns_module_1.CampaignsModule,
            messages_module_1.MessagesModule,
            receipts_module_1.ReceiptsModule,
            agent_module_1.AgentModule,
            queue_module_1.QueueModule,
            seed_module_1.SeedModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map