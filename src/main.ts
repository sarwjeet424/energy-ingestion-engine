import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Energy Ingestion Engine')
    .setDescription(
      `High-Scale Energy Ingestion API for Smart Meters and EV Fleets.
      
## Overview
This API handles telemetry ingestion from 10,000+ devices with 60-second heartbeats.

## Data Streams
- **Meter Stream**: AC power consumption from utility grid
- **Vehicle Stream**: DC power delivered to EV batteries, SoC, temperature

## Architecture
- **Hot Store**: Current status (UPSERT) for fast dashboard queries
- **Cold Store**: Historical data (INSERT) for analytics and audit`,
    )
    .setVersion('1.0')
    .addTag('Telemetry', 'Ingestion endpoints for meter and vehicle data')
    .addTag('Analytics', 'Performance analytics and efficiency calculations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS for development
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Energy Ingestion Engine running on http://localhost:${port}`);
  logger.log(`📚 Swagger docs available at http://localhost:${port}/api`);
  logger.log(
    `📊 Telemetry endpoints: POST /v1/telemetry/meter, POST /v1/telemetry/vehicle`,
  );
  logger.log(`📈 Analytics endpoint: GET /v1/analytics/performance/:vehicleId`);
}
bootstrap();
