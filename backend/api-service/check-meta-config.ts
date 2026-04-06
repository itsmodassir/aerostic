
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AdminConfigService } from './admin/services/admin-config.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(AdminConfigService);
  
  const appId = await configService.getConfigValue('meta.app_id');
  const appSecret = await configService.getConfigValue('meta.app_secret');
  const redirectUri = await configService.getConfigValue('meta.redirect_uri');
  const verifyToken = await configService.getConfigValue('meta.webhook_verify_token');

  console.log('--- Meta Configuration Status ---');
  console.log('App ID:', appId ? 'SET' : 'MISSING');
  console.log('App Secret:', appSecret ? 'SET' : 'MISSING');
  console.log('Redirect URI:', redirectUri);
  console.log('Verify Token:', verifyToken ? 'SET' : 'MISSING');
  console.log('---------------------------------');

  await app.close();
}

bootstrap();
