import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
    MeterReadingHistory,
    MeterStatus,
    VehicleReadingHistory,
    VehicleStatus,
} from '../database/entities';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MeterReadingHistory,
            MeterStatus,
            VehicleReadingHistory,
            VehicleStatus,
        ]),
    ],
    controllers: [TelemetryController],
    providers: [TelemetryService],
    exports: [TelemetryService],
})
export class TelemetryModule { }
