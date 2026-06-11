"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQueryCustomersTool = createQueryCustomersTool;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
function createQueryCustomersTool(segmentsService) {
    const querySchema = zod_1.z.object({
        filters: zod_1.z
            .object({
            status: zod_1.z.string().optional().nullable().describe('Customer status: active, churned, or at_risk'),
            preferredChannel: zod_1.z.string().optional().nullable().describe('Channel: email, whatsapp, sms, or rcs'),
            minOrders: zod_1.z.number().optional().nullable().describe('Minimum total orders'),
            maxOrders: zod_1.z.number().optional().nullable().describe('Maximum total orders'),
            minSpent: zod_1.z.number().optional().nullable().describe('Minimum total spent'),
            maxSpent: zod_1.z.number().optional().nullable().describe('Maximum total spent'),
            daysSinceLastOrderGte: zod_1.z.number().optional().nullable().describe('Days since last order >= this value'),
            daysSinceLastOrderLte: zod_1.z.number().optional().nullable().describe('Days since last order <= this value'),
        })
            .optional()
            .nullable()
            .describe('Filters to apply when querying customers'),
        sortBy: zod_1.z
            .string()
            .optional()
            .nullable()
            .describe('Field to sort by: totalOrders, totalSpent, lastOrderAt, name. Default: totalOrders'),
        sortOrder: zod_1.z
            .string()
            .optional()
            .nullable()
            .describe('Sort direction: asc or desc. Default: desc'),
        limit: zod_1.z.number().optional().nullable().default(10).describe('Max number of customers to return (1-50). Default 10.'),
    });
    return tools_1.tool(async (input) => {
        const rules = [];
        if (input.filters) {
            if (input.filters.status != null) {
                rules.push({ field: 'status', operator: 'eq', value: input.filters.status });
            }
            if (input.filters.preferredChannel != null) {
                rules.push({ field: 'preferredChannel', operator: 'eq', value: input.filters.preferredChannel });
            }
            if (input.filters.minOrders != null) {
                rules.push({ field: 'totalOrders', operator: 'gte', value: input.filters.minOrders });
            }
            if (input.filters.maxOrders != null) {
                rules.push({ field: 'totalOrders', operator: 'lte', value: input.filters.maxOrders });
            }
            if (input.filters.minSpent != null) {
                rules.push({ field: 'totalSpent', operator: 'gte', value: input.filters.minSpent });
            }
            if (input.filters.maxSpent != null) {
                rules.push({ field: 'totalSpent', operator: 'lte', value: input.filters.maxSpent });
            }
            if (input.filters.daysSinceLastOrderGte != null) {
                rules.push({ field: 'daysSinceLastOrder', operator: 'days_ago_gte', value: input.filters.daysSinceLastOrderGte });
            }
            if (input.filters.daysSinceLastOrderLte != null) {
                rules.push({ field: 'daysSinceLastOrder', operator: 'days_ago_lte', value: input.filters.daysSinceLastOrderLte });
            }
        }
        const sortField = input.sortBy || 'totalOrders';
        const sortDir = (input.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
        const limit = Math.min(Math.max(input.limit || 10, 1), 50);
        const customers = await segmentsService.resolveCustomersSorted(rules, sortField, sortDir, limit);
        const allCustomers = await segmentsService.resolveCustomers(rules);
        const totalCount = allCustomers.length;
        const totalSpent = allCustomers.reduce((sum, c) => sum + Number(c.totalSpent), 0);
        const totalOrdersSum = allCustomers.reduce((sum, c) => sum + c.totalOrders, 0);
        const formatCustomer = (c) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            status: c.status,
            totalOrders: c.totalOrders,
            totalSpent: Number(c.totalSpent),
            preferredChannel: c.preferredChannel,
            daysSinceLastOrder: c.lastOrderAt
                ? Math.floor((Date.now() - new Date(c.lastOrderAt).getTime()) / (1000 * 60 * 60 * 24))
                : null,
        });
        return JSON.stringify({
            totalMatchingCustomers: totalCount,
            avgSpent: totalCount > 0 ? Math.round(totalSpent / totalCount) : 0,
            avgOrders: totalCount > 0 ? Math.round((totalOrdersSum / totalCount) * 10) / 10 : 0,
            sortedBy: sortField,
            sortDirection: sortDir,
            returnedCount: customers.length,
            customers: customers.map(formatCustomer),
        });
    }, {
        name: 'query_customers',
        description: 'Query the customer database with filters, sorting, and limit. Use this to find top customers, loyal customers, at-risk customers, etc. Always returns full customer details including name, email, phone, and order history.',
        schema: querySchema,
    });
}
//# sourceMappingURL=query-customers.tool.js.map