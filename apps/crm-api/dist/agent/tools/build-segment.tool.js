"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBuildSegmentTool = createBuildSegmentTool;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
function createBuildSegmentTool(segmentsService) {
    const segmentSchema = zod_1.z.object({
        name: zod_1.z.string().describe('Name for this segment'),
        description: zod_1.z.string().describe('Description of what this segment represents'),
        rules: zod_1.z
            .array(zod_1.z.object({
            field: zod_1.z.string().describe('Customer field: totalOrders, totalSpent, lastOrderAt, status, preferredChannel, tags, daysSinceLastOrder'),
            operator: zod_1.z.string().describe('Comparison operator: gte, lte, eq, neq, in, not_in, contains, days_ago_gte, days_ago_lte'),
            value: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.array(zod_1.z.string()), zod_1.z.array(zod_1.z.number())]).describe('Value to compare against'),
        }))
            .describe('Array of rules to define the segment. All rules are AND-ed together.'),
    });
    return tools_1.tool(async (input) => {
        const rules = input.rules.map((r) => ({
            field: r.field,
            operator: r.operator,
            value: r.value,
        }));
        const segment = await segmentsService.create({
            name: input.name,
            description: input.description,
            rules,
            createdBy: 'ai',
        });
        const customers = await segmentsService.resolveCustomers(rules);
        return JSON.stringify({
            segmentId: segment.id,
            name: segment.name,
            customerCount: customers.length,
            customers: customers.slice(0, 10).map((c) => ({
                name: c.name,
                email: c.email,
                totalOrders: c.totalOrders,
                totalSpent: Number(c.totalSpent),
                daysSinceLastOrder: c.lastOrderAt
                    ? Math.floor((Date.now() - new Date(c.lastOrderAt).getTime()) / (1000 * 60 * 60 * 24))
                    : null,
            })),
        });
    }, {
        name: 'build_segment',
        description: 'Create a named customer segment from rules. Returns the segment with customer count and sample customers.',
        schema: segmentSchema,
    });
}
//# sourceMappingURL=build-segment.tool.js.map