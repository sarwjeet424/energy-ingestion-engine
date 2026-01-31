"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Energy Ingestion Engine')
        .setDescription(`High-Scale Energy Ingestion API for Smart Meters and EV Fleets.
      
## Overview
This API handles telemetry ingestion from 10,000+ devices with 60-second heartbeats.

## Data Streams
- **Meter Stream**: AC power consumption from utility grid
- **Vehicle Stream**: DC power delivered to EV batteries, SoC, temperature

## Architecture
- **Hot Store**: Current status (UPSERT) for fast dashboard queries
- **Cold Store**: Historical data (INSERT) for analytics and audit`)
        .setVersion('1.0')
        .addTag('Telemetry', 'Ingestion endpoints for meter and vehicle data')
        .addTag('Analytics', 'Performance analytics and efficiency calculations')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    app.enableCors();
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    logger.log(`🚀 Energy Ingestion Engine running on http://localhost:${port}`);
    logger.log(`📚 Swagger docs available at http://localhost:${port}/api`);
    logger.log(`📊 Telemetry endpoints: POST /v1/telemetry/meter, POST /v1/telemetry/vehicle`);
    logger.log(`📈 Analytics endpoint: GET /v1/analytics/performance/:vehicleId`);
}
bootstrap();
//# sourceMappingURL=main.js.map