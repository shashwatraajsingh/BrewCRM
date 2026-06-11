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
exports.SegmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const segment_entity_1 = require("./segment.entity");
const customer_entity_1 = require("../customers/customer.entity");
let SegmentsService = class SegmentsService {
    constructor(segmentRepo, customerRepo) {
        this.segmentRepo = segmentRepo;
        this.customerRepo = customerRepo;
    }
    async findAll() {
        return this.segmentRepo.find({ order: { createdAt: 'DESC' } });
    }
    async create(data) {
        const segment = this.segmentRepo.create({
            name: data.name,
            description: data.description,
            rules: data.rules,
            createdBy: data.createdBy || 'manual',
        });
        const saved = await this.segmentRepo.save(segment);
        const customers = await this.resolveCustomers(saved.rules);
        saved.customerCount = customers.length;
        await this.segmentRepo.save(saved);
        return saved;
    }
    async findOneWithCustomers(id, pagination) {
        const segment = await this.segmentRepo.findOne({ where: { id } });
        if (!segment) {
            throw new common_1.NotFoundException(`Segment ${id} not found`);
        }
        const allCustomers = await this.resolveCustomers(segment.rules);
        const total = allCustomers.length;
        const customers = allCustomers.slice(pagination.offset, pagination.offset + pagination.limit);
        return { segment, customers, total };
    }
    async findOne(id) {
        const segment = await this.segmentRepo.findOne({ where: { id } });
        if (!segment) {
            throw new common_1.NotFoundException(`Segment ${id} not found`);
        }
        return segment;
    }
    async remove(id) {
        const result = await this.segmentRepo.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Segment ${id} not found`);
        }
    }
    async refreshCount(id) {
        const segment = await this.findOne(id);
        const customers = await this.resolveCustomers(segment.rules);
        segment.customerCount = customers.length;
        return this.segmentRepo.save(segment);
    }
    async resolveCustomers(rules) {
        const qb = this.customerRepo.createQueryBuilder('customer');
        let paramIndex = 0;
        for (const rule of rules) {
            paramIndex++;
            const paramName = `p${paramIndex}`;
            this.applyRule(qb, rule, paramName);
        }
        return qb.getMany();
    }
    async resolveCustomersSorted(rules, sortBy, sortOrder, limit) {
        const qb = this.customerRepo.createQueryBuilder('customer');
        let paramIndex = 0;
        for (const rule of rules) {
            paramIndex++;
            const paramName = `p${paramIndex}`;
            this.applyRule(qb, rule, paramName);
        }
        const allowedSortFields = ['totalOrders', 'totalSpent', 'lastOrderAt', 'name', 'createdAt'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'totalOrders';
        qb.orderBy(`customer.${safeSortBy}`, sortOrder);
        qb.limit(limit);
        return qb.getMany();
    }
    applyRule(qb, rule, paramName) {
        const { field, operator, value } = rule;
        if (field === 'daysSinceLastOrder') {
            const expr = `EXTRACT(DAY FROM NOW() - customer.lastOrderAt)`;
            switch (operator) {
                case 'gte':
                case 'days_ago_gte':
                    qb.andWhere(`${expr} >= :${paramName}`, { [paramName]: value });
                    break;
                case 'lte':
                case 'days_ago_lte':
                    qb.andWhere(`${expr} <= :${paramName}`, { [paramName]: value });
                    break;
                case 'eq':
                    qb.andWhere(`${expr} = :${paramName}`, { [paramName]: value });
                    break;
                default:
                    qb.andWhere(`${expr} >= :${paramName}`, { [paramName]: value });
            }
            return;
        }
        if (field === 'tags') {
            if (operator === 'contains') {
                qb.andWhere(`customer.tags @> :${paramName}::jsonb`, {
                    [paramName]: JSON.stringify([value]),
                });
                return;
            }
            if (operator === 'in') {
                const values = Array.isArray(value) ? value : [value];
                qb.andWhere(`customer.tags ?| :${paramName}`, {
                    [paramName]: values,
                });
                return;
            }
        }
        const columnName = `customer.${field}`;
        switch (operator) {
            case 'gte':
                qb.andWhere(`${columnName} >= :${paramName}`, { [paramName]: value });
                break;
            case 'lte':
                qb.andWhere(`${columnName} <= :${paramName}`, { [paramName]: value });
                break;
            case 'eq':
                qb.andWhere(`${columnName} = :${paramName}`, { [paramName]: value });
                break;
            case 'neq':
                qb.andWhere(`${columnName} != :${paramName}`, { [paramName]: value });
                break;
            case 'in':
                qb.andWhere(`${columnName} IN (:...${paramName})`, {
                    [paramName]: Array.isArray(value) ? value : [value],
                });
                break;
            case 'not_in':
                qb.andWhere(`${columnName} NOT IN (:...${paramName})`, {
                    [paramName]: Array.isArray(value) ? value : [value],
                });
                break;
            case 'days_ago_gte':
                qb.andWhere(`EXTRACT(DAY FROM NOW() - ${columnName}) >= :${paramName}`, { [paramName]: value });
                break;
            case 'days_ago_lte':
                qb.andWhere(`EXTRACT(DAY FROM NOW() - ${columnName}) <= :${paramName}`, { [paramName]: value });
                break;
            case 'contains':
                qb.andWhere(`${columnName}::text ILIKE :${paramName}`, {
                    [paramName]: `%${value}%`,
                });
                break;
            default:
                qb.andWhere(`${columnName} = :${paramName}`, { [paramName]: value });
        }
    }
};
exports.SegmentsService = SegmentsService;
exports.SegmentsService = SegmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(segment_entity_1.Segment)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SegmentsService);
//# sourceMappingURL=segments.service.js.map