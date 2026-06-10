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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("./customer.entity");
let CustomersService = class CustomersService {
    constructor(customerRepo) {
        this.customerRepo = customerRepo;
    }
    async findAll(options) {
        const qb = this.customerRepo.createQueryBuilder('customer');
        if (options.status) {
            qb.andWhere('customer.status = :status', { status: options.status });
        }
        if (options.channel) {
            qb.andWhere('customer.preferredChannel = :channel', {
                channel: options.channel,
            });
        }
        const total = await qb.getCount();
        qb.orderBy('customer.createdAt', 'DESC');
        if (options.limit) {
            qb.limit(options.limit);
        }
        if (options.offset) {
            qb.offset(options.offset);
        }
        const customers = await qb.getMany();
        return { data: customers, total };
    }
    async findOne(id) {
        const customer = await this.customerRepo.findOne({
            where: { id },
            relations: ['orders'],
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer ${id} not found`);
        }
        return customer;
    }
    async getStats() {
        const total = await this.customerRepo.count();
        const active = await this.customerRepo.count({
            where: { status: 'active' },
        });
        const churned = await this.customerRepo.count({
            where: { status: 'churned' },
        });
        const at_risk = await this.customerRepo.count({
            where: { status: 'at_risk' },
        });
        const result = await this.customerRepo
            .createQueryBuilder('customer')
            .select('AVG(customer.totalSpent / NULLIF(customer.totalOrders, 0))', 'avgOrderValue')
            .addSelect('AVG(customer.totalOrders)', 'avgOrderCount')
            .where('customer.totalOrders > 0')
            .getRawOne();
        return {
            total,
            active,
            churned,
            at_risk,
            avgOrderValue: parseFloat(result?.avgOrderValue || '0'),
            avgOrderCount: parseFloat(result?.avgOrderCount || '0'),
        };
    }
    async count() {
        return this.customerRepo.count();
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomersService);
//# sourceMappingURL=customers.service.js.map