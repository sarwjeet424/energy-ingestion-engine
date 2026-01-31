import { TelemetryService } from './telemetry.service';
import { MeterTelemetryDto, VehicleTelemetryDto } from './dto';
export declare class TelemetryController {
    private readonly telemetryService;
    private readonly logger;
    constructor(telemetryService: TelemetryService);
    ingestMeter(dto: MeterTelemetryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            historyId: string;
            meterId: string;
            timestamp: string;
        };
    }>;
    ingestVehicle(dto: VehicleTelemetryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            historyId: string;
            vehicleId: string;
            timestamp: string;
        };
    }>;
    getMeterStatus(meterId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    } | {
        success: boolean;
        data: import("../database").MeterStatus;
        message?: undefined;
    }>;
    getVehicleStatus(vehicleId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    } | {
        success: boolean;
        data: import("../database").VehicleStatus;
        message?: undefined;
    }>;
}
