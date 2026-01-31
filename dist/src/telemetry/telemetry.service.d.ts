import { Repository } from 'typeorm';
import { MeterReadingHistory, MeterStatus, VehicleReadingHistory, VehicleStatus } from '../database/entities';
import { MeterTelemetryDto, VehicleTelemetryDto } from './dto';
export declare class TelemetryService {
    private readonly meterHistoryRepo;
    private readonly meterStatusRepo;
    private readonly vehicleHistoryRepo;
    private readonly vehicleStatusRepo;
    private readonly logger;
    constructor(meterHistoryRepo: Repository<MeterReadingHistory>, meterStatusRepo: Repository<MeterStatus>, vehicleHistoryRepo: Repository<VehicleReadingHistory>, vehicleStatusRepo: Repository<VehicleStatus>);
    ingestMeterReading(dto: MeterTelemetryDto): Promise<{
        historyId: string;
        statusUpdated: boolean;
    }>;
    ingestVehicleReading(dto: VehicleTelemetryDto): Promise<{
        historyId: string;
        statusUpdated: boolean;
    }>;
    getMeterStatus(meterId: string): Promise<MeterStatus | null>;
    getVehicleStatus(vehicleId: string): Promise<VehicleStatus | null>;
}
