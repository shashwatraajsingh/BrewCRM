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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("../customers/customer.entity");
const order_entity_1 = require("../orders/order.entity");
const segment_entity_1 = require("../segments/segment.entity");
const FIRST_NAMES_MALE = [
    'Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Reyansh', 'Ayaan', 'Krishna',
    'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Vivaan', 'Ansh', 'Dhruv', 'Kabir',
    'Ritvik', 'Aarush', 'Kian', 'Darsh', 'Rudra', 'Arnav', 'Pranav', 'Advait',
    'Rishi', 'Yash', 'Nikhil', 'Rohan', 'Tanmay', 'Harsh', 'Kunal', 'Varun',
    'Siddharth', 'Abhishek', 'Manish', 'Rajesh', 'Suresh', 'Vikram', 'Ajay',
    'Rahul', 'Amit', 'Deepak', 'Gaurav', 'Karthik', 'Naveen', 'Pavan', 'Rakesh',
    'Sameer', 'Tarun', 'Vishal',
];
const FIRST_NAMES_FEMALE = [
    'Aanya', 'Saanvi', 'Aadhya', 'Aaradhya', 'Ananya', 'Pari', 'Anika', 'Navya',
    'Diya', 'Myra', 'Isha', 'Sara', 'Riya', 'Ahana', 'Anvi', 'Prisha', 'Kiara',
    'Meera', 'Nisha', 'Pooja', 'Shreya', 'Tanvi', 'Divya', 'Kavya', 'Neha',
    'Priya', 'Swati', 'Anjali', 'Sneha', 'Pallavi', 'Sunita', 'Rekha', 'Geeta',
    'Lata', 'Jyoti', 'Suman', 'Rani', 'Kiran', 'Rashmi', 'Shweta', 'Deepika',
    'Padma', 'Lakshmi', 'Sita', 'Uma', 'Radha', 'Kamala', 'Seema', 'Nidhi', 'Tara',
];
const LAST_NAMES = [
    'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Shah', 'Mehta',
    'Joshi', 'Agarwal', 'Reddy', 'Rao', 'Nair', 'Menon', 'Iyer', 'Pillai',
    'Chopra', 'Malhotra', 'Kapoor', 'Bhat', 'Deshmukh', 'Kulkarni', 'Jain',
    'Chauhan', 'Mishra', 'Pandey', 'Dubey', 'Tiwari', 'Saxena', 'Srivastava',
    'Banerjee', 'Chatterjee', 'Mukherjee', 'Das', 'Bose', 'Sen', 'Ghosh',
    'Roy', 'Dutta', 'Majumdar',
];
const TAGS_POOL = [
    'loyalty-member',
    'cold-brew-fan',
    'morning-regular',
    'weekend-visitor',
    'subscription',
];
const PRODUCT_CATEGORIES = ['coffee', 'food', 'merchandise', 'subscription'];
const PRODUCT_WEIGHTS = [0.5, 0.25, 0.15, 0.1];
const COFFEE_ITEMS = [
    { name: 'Espresso', price: 180 },
    { name: 'Cappuccino', price: 220 },
    { name: 'Cold Brew', price: 250 },
    { name: 'Latte', price: 230 },
    { name: 'Americano', price: 190 },
    { name: 'Mocha', price: 260 },
    { name: 'Filter Coffee', price: 150 },
    { name: 'Flat White', price: 240 },
];
const FOOD_ITEMS = [
    { name: 'Croissant', price: 180 },
    { name: 'Sandwich', price: 250 },
    { name: 'Brownie', price: 150 },
    { name: 'Muffin', price: 130 },
    { name: 'Cookie', price: 100 },
    { name: 'Bagel', price: 200 },
];
const MERCH_ITEMS = [
    { name: 'Roast & Co. Mug', price: 450 },
    { name: 'Tote Bag', price: 350 },
    { name: 'T-Shirt', price: 500 },
    { name: 'Tumbler', price: 400 },
];
const SUB_ITEMS = [
    { name: 'Monthly Coffee Box', price: 999 },
    { name: 'Weekly Brew Plan', price: 599 },
    { name: 'Annual Membership', price: 2999 },
];
let SeedService = SeedService_1 = class SeedService {
    constructor(customerRepo, orderRepo, segmentRepo) {
        this.customerRepo = customerRepo;
        this.orderRepo = orderRepo;
        this.segmentRepo = segmentRepo;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async seed() {
        const existingCount = await this.customerRepo.count();
        if (existingCount > 0) {
            this.logger.log(`Seed skipped: ${existingCount} customers already exist`);
            return;
        }
        this.logger.log('Starting seed...');
        const customers = await this.generateCustomers(500);
        this.logger.log(`Created ${customers.length} customers`);
        const orders = await this.generateOrders(customers, 2000);
        this.logger.log(`Created ${orders.length} orders`);
        await this.updateCustomerAggregates(customers);
        this.logger.log('Updated customer aggregates');
        await this.createSegments();
        this.logger.log('Created 5 pre-built segments');
        this.logger.log('Seed completed!');
    }
    async generateCustomers(count) {
        const customers = [];
        const usedEmails = new Set();
        for (let i = 0; i < count; i++) {
            const isFemale = Math.random() < 0.5;
            const firstName = isFemale
                ? FIRST_NAMES_FEMALE[Math.floor(Math.random() * FIRST_NAMES_FEMALE.length)]
                : FIRST_NAMES_MALE[Math.floor(Math.random() * FIRST_NAMES_MALE.length)];
            const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
            const name = `${firstName} ${lastName}`;
            let email;
            let attempt = 0;
            do {
                const suffix = attempt > 0 ? `${attempt}` : '';
                const domain = Math.random() < 0.7 ? 'gmail.com' : 'yahoo.com';
                email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${suffix}@${domain}`;
                attempt++;
            } while (usedEmails.has(email));
            usedEmails.add(email);
            const phone = `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`;
            const channelRand = Math.random();
            let preferredChannel;
            if (channelRand < 0.6)
                preferredChannel = 'whatsapp';
            else if (channelRand < 0.85)
                preferredChannel = 'email';
            else if (channelRand < 0.95)
                preferredChannel = 'sms';
            else
                preferredChannel = 'rcs';
            const statusRand = Math.random();
            let status;
            if (statusRand < 0.7)
                status = 'active';
            else if (statusRand < 0.9)
                status = 'at_risk';
            else
                status = 'churned';
            const numTags = Math.floor(Math.random() * 3);
            const shuffledTags = [...TAGS_POOL].sort(() => Math.random() - 0.5);
            const tags = shuffledTags.slice(0, numTags);
            const now = new Date();
            let lastOrderAt;
            if (status === 'active') {
                lastOrderAt = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000);
            }
            else if (status === 'at_risk') {
                lastOrderAt = new Date(now.getTime() - (60 + Math.random() * 30) * 24 * 60 * 60 * 1000);
            }
            else {
                lastOrderAt = new Date(now.getTime() - (90 + Math.random() * 450) * 24 * 60 * 60 * 1000);
            }
            const maxFirstOrderAge = 18 * 30 * 24 * 60 * 60 * 1000;
            const minFirstOrderAge = now.getTime() - lastOrderAt.getTime() + 24 * 60 * 60 * 1000;
            const firstOrderAt = new Date(now.getTime() -
                Math.max(minFirstOrderAge, Math.random() * maxFirstOrderAge));
            customers.push({
                name,
                email,
                phone,
                preferredChannel,
                status,
                tags,
                lastOrderAt,
                firstOrderAt,
                totalSpent: 0,
                totalOrders: 0,
            });
        }
        const entities = this.customerRepo.create(customers);
        return this.customerRepo.save(entities, { chunk: 100 });
    }
    async generateOrders(customers, targetCount) {
        const orders = [];
        const weights = customers.map(() => {
            const base = 1 + Math.floor(Math.random() * 5);
            return Math.random() < 0.2 ? base * 3 : base;
        });
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        for (let i = 0; i < targetCount; i++) {
            let rand = Math.random() * totalWeight;
            let customerIndex = 0;
            for (let j = 0; j < weights.length; j++) {
                rand -= weights[j];
                if (rand <= 0) {
                    customerIndex = j;
                    break;
                }
            }
            const customer = customers[customerIndex];
            const catRand = Math.random();
            let category;
            let items;
            let cumulativeWeight = 0;
            let selectedCategory = PRODUCT_CATEGORIES[0];
            for (let k = 0; k < PRODUCT_WEIGHTS.length; k++) {
                cumulativeWeight += PRODUCT_WEIGHTS[k];
                if (catRand < cumulativeWeight) {
                    selectedCategory = PRODUCT_CATEGORIES[k];
                    break;
                }
            }
            category = selectedCategory;
            let itemPool;
            switch (category) {
                case 'coffee':
                    itemPool = COFFEE_ITEMS;
                    break;
                case 'food':
                    itemPool = FOOD_ITEMS;
                    break;
                case 'merchandise':
                    itemPool = MERCH_ITEMS;
                    break;
                case 'subscription':
                    itemPool = SUB_ITEMS;
                    break;
                default:
                    itemPool = COFFEE_ITEMS;
            }
            const numItems = 1 + Math.floor(Math.random() * 2);
            const orderItems = [];
            let totalAmount = 0;
            for (let j = 0; j < numItems; j++) {
                const item = itemPool[Math.floor(Math.random() * itemPool.length)];
                orderItems.push({ name: item.name, quantity: 1, price: item.price });
                totalAmount += item.price;
            }
            const firstOrderTime = customer.firstOrderAt
                ? new Date(customer.firstOrderAt).getTime()
                : Date.now() - 18 * 30 * 24 * 60 * 60 * 1000;
            const lastOrderTime = customer.lastOrderAt
                ? new Date(customer.lastOrderAt).getTime()
                : Date.now();
            const orderTime = firstOrderTime + Math.random() * (lastOrderTime - firstOrderTime);
            orders.push({
                customerId: customer.id,
                amount: totalAmount,
                status: 'completed',
                productCategory: category,
                items: orderItems,
                orderedAt: new Date(orderTime),
            });
        }
        const entities = this.orderRepo.create(orders);
        return this.orderRepo.save(entities, { chunk: 100 });
    }
    async updateCustomerAggregates(customers) {
        for (const customer of customers) {
            const result = await this.orderRepo
                .createQueryBuilder('order')
                .select('COUNT(*)', 'count')
                .addSelect('COALESCE(SUM(order.amount), 0)', 'total')
                .where('order.customerId = :id', { id: customer.id })
                .getRawOne();
            const totalOrders = parseInt(result?.count || '0', 10);
            const totalSpent = parseFloat(result?.total || '0');
            await this.customerRepo.update(customer.id, {
                totalOrders,
                totalSpent,
            });
        }
    }
    async createSegments() {
        const segments = [
            {
                name: 'Lapsed Loyal',
                description: 'Loyal customers (5+ orders) who haven\'t ordered in 60+ days',
                rules: [
                    { field: 'totalOrders', operator: 'gte', value: 5 },
                    { field: 'daysSinceLastOrder', operator: 'days_ago_gte', value: 60 },
                ],
            },
            {
                name: 'High Spenders',
                description: 'Customers who have spent ₹2000 or more',
                rules: [{ field: 'totalSpent', operator: 'gte', value: 2000 }],
            },
            {
                name: 'At Risk',
                description: 'Customers flagged as at-risk of churning',
                rules: [{ field: 'status', operator: 'eq', value: 'at_risk' }],
            },
            {
                name: 'WhatsApp Engaged',
                description: 'WhatsApp-preferred customers with 2+ orders',
                rules: [
                    { field: 'preferredChannel', operator: 'eq', value: 'whatsapp' },
                    { field: 'totalOrders', operator: 'gte', value: 2 },
                ],
            },
            {
                name: 'New Customers',
                description: 'Recent customers with 2 or fewer orders who ordered in the last 30 days',
                rules: [
                    { field: 'totalOrders', operator: 'lte', value: 2 },
                    { field: 'daysSinceLastOrder', operator: 'days_ago_lte', value: 30 },
                ],
            },
        ];
        for (const segData of segments) {
            const segment = this.segmentRepo.create({
                ...segData,
                createdBy: 'manual',
            });
            const saved = await this.segmentRepo.save(segment);
            const qb = this.customerRepo.createQueryBuilder('customer');
            let paramIndex = 0;
            for (const rule of segData.rules) {
                paramIndex++;
                const paramName = `p${paramIndex}`;
                if (rule.field === 'daysSinceLastOrder') {
                    const expr = `EXTRACT(DAY FROM NOW() - customer.lastOrderAt)`;
                    if (rule.operator === 'days_ago_gte' ||
                        rule.operator === 'gte') {
                        qb.andWhere(`${expr} >= :${paramName}`, {
                            [paramName]: rule.value,
                        });
                    }
                    else {
                        qb.andWhere(`${expr} <= :${paramName}`, {
                            [paramName]: rule.value,
                        });
                    }
                }
                else {
                    const col = `customer.${rule.field}`;
                    switch (rule.operator) {
                        case 'gte':
                            qb.andWhere(`${col} >= :${paramName}`, {
                                [paramName]: rule.value,
                            });
                            break;
                        case 'lte':
                            qb.andWhere(`${col} <= :${paramName}`, {
                                [paramName]: rule.value,
                            });
                            break;
                        case 'eq':
                            qb.andWhere(`${col} = :${paramName}`, {
                                [paramName]: rule.value,
                            });
                            break;
                        default:
                            qb.andWhere(`${col} = :${paramName}`, {
                                [paramName]: rule.value,
                            });
                    }
                }
            }
            const count = await qb.getCount();
            saved.customerCount = count;
            await this.segmentRepo.save(saved);
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(segment_entity_1.Segment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map