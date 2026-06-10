import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { SegmentsService } from '../../segments/segments.service';
import { SegmentRule } from '../../segments/segment.entity';

export function createQueryCustomersTool(segmentsService: SegmentsService) {
  const querySchema = z.object({
    filters: z
      .object({
        status: z.string().optional().nullable().describe('Customer status: active, churned, or at_risk'),
        preferredChannel: z.string().optional().nullable().describe('Channel: email, whatsapp, sms, or rcs'),
        minOrders: z.number().optional().nullable().describe('Minimum total orders'),
        maxOrders: z.number().optional().nullable().describe('Maximum total orders'),
        minSpent: z.number().optional().nullable().describe('Minimum total spent'),
        maxSpent: z.number().optional().nullable().describe('Maximum total spent'),
        daysSinceLastOrderGte: z.number().optional().nullable().describe('Days since last order >= this value'),
        daysSinceLastOrderLte: z.number().optional().nullable().describe('Days since last order <= this value'),
      })
      .optional()
      .nullable()
      .describe('Filters to apply when querying customers'),
    limit: z.number().optional().nullable().default(10).describe('Max number of sample customers to return'),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tool as any)(
    async (input: z.infer<typeof querySchema>) => {
      const rules: SegmentRule[] = [];

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
    },
    {
      name: 'query_customers',
      description:
        'Query the customer database with filters. Returns customer stats and sample data.',
      schema: querySchema,
    },
  );
}
