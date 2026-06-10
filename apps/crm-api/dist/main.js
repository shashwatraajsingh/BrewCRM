"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const seed_service_1 = require("./seed/seed.service");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            process.env['FRONTEND_URL'] || 'http://localhost:3002',
            'http://localhost:3002',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
    });
    const httpAdapter = app.getHttpAdapter();
    httpAdapter.get('/health', async (_req, res) => {
        res.json({ status: 'ok', service: 'crm-api', timestamp: new Date().toISOString() });
    });
    const port = process.env['PORT'] || 3000;
    await app.listen(port);
    logger.log(`CRM API running on http://localhost:${port}`);
    try {
        const seedService = app.get(seed_service_1.SeedService);
        await seedService.seed();
    }
    catch (error) {
        logger.error(`Seed failed: ${error}`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map