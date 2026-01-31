import { AnalyticsService, PerformanceSummary } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    private readonly logger;
    constructor(analyticsService: AnalyticsService);
    getVehiclePerformance(vehicleId: string): Promise<{
        success: boolean;
        data: PerformanceSummary;
    }>;
    getFleetSummary(): Promise<{
        success: boolean;
        data: {
            totalVehicles: number;
            averageEfficiency: number;
            criticalCount: number;
            warningCount: number;
            healthyCount: number;
        };
    }>;
}
