const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/apps/crm-api/src/app.module');
const { CampaignsService } = require('./dist/apps/crm-api/src/campaigns/campaigns.service');

async function bootstrap() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const campaignsService = app.get(CampaignsService);
    
    const campaign = await campaignsService.create({
      name: 'Test',
      segmentId: 'bfec3bad-db47-4a68-9f07-0bd28eb50c74', // ID from screenshot
      channel: 'email',
      messageTemplate: 'Hello {{customer.name}}',
      aiPrompt: 'test',
    });
    console.log('Created:', campaign.id);
    
    await campaignsService.launch(campaign.id);
    console.log('Launched');
    await app.close();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
bootstrap();
