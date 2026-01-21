import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS - Portable deployment
  // In production with Nginx reverse proxy, same origin is used
  // CORS_ORIGINS env var can specify allowed origins (comma-separated)
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : true; // Allow all origins when using reverse proxy in same container

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Configuration des pipes de validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuration du préfixe global (doit être avant Swagger)
  // Note: Le health check est exclu du préfixe global
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  // Configuration Swagger (après le préfixe global pour inclure le préfixe dans les routes)
  const config = new DocumentBuilder()
    .setTitle('Meditache API')
    .setDescription('API pour la gestion des rappels d\'interventions médicales')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Servir les fichiers uploadés (pièces jointes rapports, etc.)
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  const port = process.env.API_PORT || 5550;
  const host = process.env.API_HOST || '0.0.0.0'; // Listen on all interfaces by default
  
  await app.listen(port, host);

  console.log(`🚀 API Meditache démarrée sur ${host}:${port}`);
  console.log(`📚 Documentation Swagger disponible sur http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/api/docs`);
}

bootstrap();
