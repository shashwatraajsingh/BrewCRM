"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQueryCustomersTool = createQueryCustomersTool;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
function createQueryCustomersTool(segmentsService) {
    const querySchema = zod_1.z.object({
        filters: zod_1.z
            .object({
            status: zod_1.z.string().optional().describe('Customer status: active, churned, or at_risk'),
            preferredChannel: zod_1.z.string().optional().describe('Channel: email, whatsapp, sms, or rcs'),
            minOrders: zod_1.z.number().optional().describe('Minimum total orders'),
            maxOrders: zod_1.z.number().optional().describe('Maximum total orders'),
            minSpent: zod_1.z.number().optional().describe('Minimum total spent'),
            maxSpent: zod_1.z.number().optional().describe('Maximum total spent'),
            daysSinceLastOrderGte: zod_1.z.number().optional().describe('Days since last order >= this value'),
            daysSinceLastOrderLte: zod_1.z.number().optional().describe('Days since last order <= this value'),
        })
            .optional()
            .describe('Filters to apply when querying customers'),
        limit: zod_1.z.number().optional().default(10).describe('Max number of sample customers to return'),
    });
    return tools_1.tool(async (input) => {
        const rules = [];
        if (input.filters) {
            if (input.filters.status) {
                rules.push({ field: 'status', operator: 'eq', value: input.filters.status });
            }
            if (input.filters.preferredChannel) {
                rules.push({ field: 'preferredChannel', operator: 'eq', value: input.filters.preferredChannel });
            }
            if (input.filters.minOrders !== undefined) {
                rules.push({ field: 'totalOrders', operator: 'gte', value: input.filters.minOrders });
            }
            if (input.filters.maxOrders !== undefined) {
                rules.push({ field: 'totalOrders', operator: 'lte', value: input.filters.maxOrders });
            }
            if (input.filters.minSpent !== undefined) {
                rules.push({ field: 'totalSpent', operator: 'gte', value: input.filters.minSpent });
            }
            if (input.filters.maxSpent !== undefined) {
                rules.push({ field: 'totalSpent', operator: 'lte', value: input.filters.maxSpent });
            }
            if (input.filters.daysSinceLastOrderGte !== undefined) {
                rules.push({ field: 'daysSinceLastOrder', operator: 'days_ago_gte', value: input.filters.daysSinceLastOrderGte });
            }
            if (input.filters.daysSinceLastOrderLte !== undefined) {
                rules.push({ field: 'daysSinceLastOrder', operator: 'days_ago_lte', value: input.filters.daysSinceLastOrderLte });
            }
        }
        const customers = await segmentsService.resolveCustomers(rules);
        const limit = input.limit || 10;
        const sample = customers.slice(0, limit);
        const totalSpent = customers.reduce((sum, c) => sum + Number(c.totalSpent), 0);
        const totalOrdersSum = customers.reduce((sum, c) => sum + c.totalOrders, 0);
        return JSON.stringify({
            total: customers.length,
            avgSpent: customers.length > 0 ? Math.round(totalSpent / customers.length) : 0,
            avgOrders: customers.length > 0 ? Math.round((totalOrdersSum / customers.length) * 10) / 10 : 0,
            customers: sample.map((c) => ({
                id: c.id,
                name: c.name,
                email: c.email,
                status: c.status,
                totalOrders: c.totalOrders,
                totalSpent: Number(c.totalSpent),
                preferredChannel: c.preferredChannel,
                daysSinceLastOrder: c.lastOrderAt
                    ? Math.floor((Date.now() - new Date(c.lastOrderAt).getTime()) / (1000 * 60 * 60 * 24))
                    : null,
            })),
        });
    }, {
        name: 'query_customers',
        description: 'Query the customer database with filters. Returns customer stats and sample data.',
        schema: querySchema,
    });
}
//# sourceMappingURL=query-customers.tool.js.map