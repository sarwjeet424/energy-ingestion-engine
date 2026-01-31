import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
    MeterReadingHistory,
    VehicleReadingHistory,
    VehicleStatus,
} from '../database/entities';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MeterReadingHistory,
            VehicleReadingHistory,
            VehicleStatus,
        ]),
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule { }
