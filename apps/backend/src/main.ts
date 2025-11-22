import { webcrypto } from 'crypto';
globalThis.crypto = webcrypto as any;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 
  app.setGlobalPrefix('api', { exclude: ['json'] });

  app.enableShutdownHooks();

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  printRoutes(app);

  console.log(`🚀 API running at http://localhost:${port}/api`);


  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await app.close();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await app.close();
    process.exit(0);
  });
}

function printRoutes(app: INestApplication) {

  const server: any = (app as any).getHttpAdapter().getHttpServer();
  const router = server._events?.request?._router;
  if (!router?.stack) {
    console.log('⚠️  No routes found or non-Express adapter.');
    return;
  }

  console.log('\n== API ROUTES ==');
  router.stack
    .filter((layer: any) => layer.route)
    .forEach((layer: any) => {
      const methods = Object.keys(layer.route.methods)
        .filter((m) => layer.route.methods[m])
        .map((m) => m.toUpperCase())
        .join(',');
      const path = Array.isArray(layer.route.path)
        ? layer.route.path.join(', ')
        : layer.route.path;
      console.log(`${methods.padEnd(8)} ${path}`);
    });
  console.log('================\n');
}

bootstrap();
