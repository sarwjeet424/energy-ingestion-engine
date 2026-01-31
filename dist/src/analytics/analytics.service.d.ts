import { Repository } from 'typeorm';
import { MeterReadingHistory, VehicleReadingHistory, VehicleStatus } from '../database/entities';
export interface PerformanceSummary {
    vehicleId: string;
    period: {
        start: string;
        end: string;
    };
    totalAcConsumed: number;
    totalDcDelivered: number;
    efficiencyRatio: number;
    efficiencyPercent: string;
    avgBatteryTemp: number;
    readingsCount: {
        vehicle: number;
        meter: number;
    };
    healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}
export declare class AnalyticsService {
    private readonly meterHistoryRepo;
    private readonly vehicleHistoryRepo;
    private readonly vehicleStatusRepo;
    private readonly logger;
    private readonly EFFICIENCY_HEALTHY;
    private readonly EFFICIENCY_WARNING;
    constructor(meterHistoryRepo: Repository<MeterReadingHistory>, vehicleHistoryRepo: Repository<VehicleReadingHistory>, vehicleStatusRepo: Repository<VehicleStatus>);
    get24HourPerformanceSummary(vehicleId: string): Promise<PerformanceSummary>;
    private getCorrelatedMeterId;
    private calculateHealthStatus;
    getFleetSummary(): Promise<{
        totalVehicles: number;
        averageEfficiency: number;
        criticalCount: number;
        warningCount: number;
        healthyCount: number;
    }>;
}
