import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import {
    MeterReadingHistory,
    VehicleReadingHistory,
    VehicleStatus,
} from '../database/entities';

/**
 * Response interface for 24-hour performance analytics
 */
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

/**
 * Analytics Service
 * Provides analytical queries using indexed historical data
 * Optimized to avoid full table scans through composite indexes
 */
@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    // Efficiency thresholds for health status
    private readonly EFFICIENCY_HEALTHY = 0.85; // 85%+
    private readonly EFFICIENCY_WARNING = 0.70; // 70-85%

    constructor(
        @InjectRepository(MeterReadingHistory)
        private readonly meterHistoryRepo: Repository<MeterReadingHistory>,
        @InjectRepository(VehicleReadingHistory)
        private readonly vehicleHistoryRepo: Repository<VehicleReadingHistory>,
        @InjectRepository(VehicleStatus)
        private readonly vehicleStatusRepo: Repository<VehicleStatus>,
    ) { }

    /**
     * Get 24-hour performance summary for a vehicle
     * Uses indexed queries to avoid full table scans
     * 
     * Query uses composite index (vehicleId, timestamp) for efficient range scanning
     */
    async get24HourPerformanceSummary(
        vehicleId: string,
    ): Promise<PerformanceSummary> {
        const now = new Date();
        const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        this.logger.log(
            `Fetching 24-hour performance for vehicle ${vehicleId} from ${since.toISOString()} to ${now.toISOString()}`,
        );

        // Check if vehicle exists in the system
        const vehicleExists = await this.vehicleStatusRepo.findOne({
            where: { vehicleId },
        });

        if (!vehicleExists) {
            throw new NotFoundException(`Vehicle ${vehicleId} not found in system`);
        }

        // Query vehicle readings - uses composite index (vehicleId, timestamp)
        const vehicleData = await this.vehicleHistoryRepo
            .createQueryBuilder('vehicle')
            .select('SUM(vehicle.kwhDeliveredDc)', 'totalDcDelivered')
            .addSelect('AVG(vehicle.batteryTemp)', 'avgBatteryTemp')
            .addSelect('COUNT(*)', 'readingsCount')
            .where('vehicle.vehicleId = :vehicleId', { vehicleId })
            .andWhere('vehicle.timestamp >= :since', { since })
            .getRawOne();

        // For this implementation, we correlate meter data by assuming
        // a 1:1 relationship between vehicle and meter (e.g., METER-001 for VEH-001)
        // In production, this would use a charging session or fleet mapping table
        const correlatedMeterId = this.getCorrelatedMeterId(vehicleId);

        const meterData = await this.meterHistoryRepo
            .createQueryBuilder('meter')
            .select('SUM(meter.kwhConsumedAc)', 'totalAcConsumed')
            .addSelect('COUNT(*)', 'readingsCount')
            .where('meter.meterId = :meterId', { meterId: correlatedMeterId })
            .andWhere('meter.timestamp >= :since', { since })
            .getRawOne();

        // Parse aggregated values
        const totalDcDelivered = parseFloat(vehicleData?.totalDcDelivered) || 0;
        const totalAcConsumed = parseFloat(meterData?.totalAcConsumed) || 0;
        const avgBatteryTemp = parseFloat(vehicleData?.avgBatteryTemp) || 0;

        // Calculate efficiency ratio (DC Delivered / AC Consumed)
        // Guard against division by zero
        const efficiencyRatio =
            totalAcConsumed > 0 ? totalDcDelivered / totalAcConsumed : 0;

        // Determine health status based on efficiency
        const healthStatus = this.calculateHealthStatus(efficiencyRatio);

        this.logger.log(
            `Vehicle ${vehicleId}: Efficiency ${(efficiencyRatio * 100).toFixed(2)}% - ${healthStatus}`,
        );

        return {
            vehicleId,
            period: {
                start: since.toISOString(),
                end: now.toISOString(),
            },
            totalAcConsumed: Math.round(totalAcConsumed * 10000) / 10000,
            totalDcDelivered: Math.round(totalDcDelivered * 10000) / 10000,
            efficiencyRatio: Math.round(efficiencyRatio * 10000) / 10000,
            efficiencyPercent: `${(efficiencyRatio * 100).toFixed(2)}%`,
            avgBatteryTemp: Math.round(avgBatteryTemp * 100) / 100,
            readingsCount: {
                vehicle: parseInt(vehicleData?.readingsCount) || 0,
                meter: parseInt(meterData?.readingsCount) || 0,
            },
            healthStatus,
        };
    }

    /**
     * Get correlated meter ID for a vehicle
     * In production, this would query a fleet/session mapping table
     * For demo purposes, we use a simple naming convention
     */
    private getCorrelatedMeterId(vehicleId: string): string {
        // Simple correlation: VEH-001 -> METER-001
        // In production, use a junction table or session-based correlation
        return vehicleId.replace('VEH-', 'METER-');
    }

    /**
     * Calculate health status based on efficiency ratio
     * Power Loss Thesis: AC > DC due to conversion losses
     * - HEALTHY: >= 85% efficiency (normal operation)
     * - WARNING: 70-85% efficiency (investigate)
     * - CRITICAL: < 70% efficiency (hardware fault/leakage suspected)
     */
    private calculateHealthStatus(
        efficiencyRatio: number,
    ): 'HEALTHY' | 'WARNING' | 'CRITICAL' {
        if (efficiencyRatio >= this.EFFICIENCY_HEALTHY) {
            return 'HEALTHY';
        } else if (efficiencyRatio >= this.EFFICIENCY_WARNING) {
            return 'WARNING';
        } else {
            return 'CRITICAL';
        }
    }

    /**
     * Get fleet-wide analytics summary
     * Aggregates performance across all vehicles for a time period
     */
    async getFleetSummary(): Promise<{
        totalVehicles: number;
        averageEfficiency: number;
        criticalCount: number;
        warningCount: number;
        healthyCount: number;
    }> {
        const vehicles = await this.vehicleStatusRepo.find();

        let totalEfficiency = 0;
        let criticalCount = 0;
        let warningCount = 0;
        let healthyCount = 0;

        for (const vehicle of vehicles) {
            try {
                const summary = await this.get24HourPerformanceSummary(
                    vehicle.vehicleId,
                );
                totalEfficiency += summary.efficiencyRatio;

                switch (summary.healthStatus) {
                    case 'CRITICAL':
                        criticalCount++;
                        break;
                    case 'WARNING':
                        warningCount++;
                        break;
                    case 'HEALTHY':
                        healthyCount++;
                        break;
                }
            } catch {
                // Skip vehicles with insufficient data
            }
        }

        return {
            totalVehicles: vehicles.length,
            averageEfficiency:
                vehicles.length > 0 ? totalEfficiency / vehicles.length : 0,
            criticalCount,
            warningCount,
            healthyCount,
        };
    }
}
