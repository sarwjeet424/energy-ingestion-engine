import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    MeterReadingHistory,
    MeterStatus,
    VehicleReadingHistory,
    VehicleStatus,
} from '../database/entities';
import { MeterTelemetryDto, VehicleTelemetryDto } from './dto';

/**
 * Telemetry Service
 * Handles dual-write persistence for hot (operational) and cold (historical) storage
 * Implements INSERT for history (append-only) and UPSERT for live status
 */
@Injectable()
export class TelemetryService {
    private readonly logger = new Logger(TelemetryService.name);

    constructor(
        @InjectRepository(MeterReadingHistory)
        private readonly meterHistoryRepo: Repository<MeterReadingHistory>,
        @InjectRepository(MeterStatus)
        private readonly meterStatusRepo: Repository<MeterStatus>,
        @InjectRepository(VehicleReadingHistory)
        private readonly vehicleHistoryRepo: Repository<VehicleReadingHistory>,
        @InjectRepository(VehicleStatus)
        private readonly vehicleStatusRepo: Repository<VehicleStatus>,
    ) { }

    /**
     * Ingest Meter Telemetry
     * 1. INSERT into cold store (append-only for audit trail)
     * 2. UPSERT into hot store (atomic update for dashboard)
     */
    async ingestMeterReading(dto: MeterTelemetryDto): Promise<{
        historyId: string;
        statusUpdated: boolean;
    }> {
        const timestamp = new Date(dto.timestamp);

        // 1. INSERT into historical (cold) store - append-only
        const historyRecord = this.meterHistoryRepo.create({
            meterId: dto.meterId,
            kwhConsumedAc: dto.kwhConsumedAc,
            voltage: dto.voltage,
            timestamp,
        });
        const savedHistory = await this.meterHistoryRepo.save(historyRecord);

        this.logger.debug(
            `Meter ${dto.meterId}: Saved history record ${savedHistory.id}`,
        );

        // 2. UPSERT into operational (hot) store - atomic update
        await this.meterStatusRepo.upsert(
            {
                meterId: dto.meterId,
                kwhConsumedAc: dto.kwhConsumedAc,
                voltage: dto.voltage,
                lastReading: timestamp,
            },
            {
                conflictPaths: ['meterId'],
                skipUpdateIfNoValuesChanged: true,
            },
        );

        this.logger.debug(`Meter ${dto.meterId}: Upserted status`);

        return {
            historyId: savedHistory.id,
            statusUpdated: true,
        };
    }

    /**
     * Ingest Vehicle Telemetry
     * 1. INSERT into cold store (append-only for audit trail)
     * 2. UPSERT into hot store (atomic update for dashboard)
     */
    async ingestVehicleReading(dto: VehicleTelemetryDto): Promise<{
        historyId: string;
        statusUpdated: boolean;
    }> {
        const timestamp = new Date(dto.timestamp);

        // 1. INSERT into historical (cold) store - append-only
        const historyRecord = this.vehicleHistoryRepo.create({
            vehicleId: dto.vehicleId,
            soc: dto.soc,
            kwhDeliveredDc: dto.kwhDeliveredDc,
            batteryTemp: dto.batteryTemp,
            timestamp,
        });
        const savedHistory = await this.vehicleHistoryRepo.save(historyRecord);

        this.logger.debug(
            `Vehicle ${dto.vehicleId}: Saved history record ${savedHistory.id}`,
        );

        // 2. UPSERT into operational (hot) store - atomic update
        await this.vehicleStatusRepo.upsert(
            {
                vehicleId: dto.vehicleId,
                soc: dto.soc,
                kwhDeliveredDc: dto.kwhDeliveredDc,
                batteryTemp: dto.batteryTemp,
                lastReading: timestamp,
            },
            {
                conflictPaths: ['vehicleId'],
                skipUpdateIfNoValuesChanged: true,
            },
        );

        this.logger.debug(`Vehicle ${dto.vehicleId}: Upserted status`);

        return {
            historyId: savedHistory.id,
            statusUpdated: true,
        };
    }

    /**
     * Get current status for a meter (fast lookup from hot store)
     */
    async getMeterStatus(meterId: string): Promise<MeterStatus | null> {
        return this.meterStatusRepo.findOne({ where: { meterId } });
    }

    /**
     * Get current status for a vehicle (fast lookup from hot store)
     */
    async getVehicleStatus(vehicleId: string): Promise<VehicleStatus | null> {
        return this.vehicleStatusRepo.findOne({ where: { vehicleId } });
    }
}
