"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    meterHistoryRepo;
    vehicleHistoryRepo;
    vehicleStatusRepo;
    logger = new common_1.Logger(AnalyticsService_1.name);
    EFFICIENCY_HEALTHY = 0.85;
    EFFICIENCY_WARNING = 0.70;
    constructor(meterHistoryRepo, vehicleHistoryRepo, vehicleStatusRepo) {
        this.meterHistoryRepo = meterHistoryRepo;
        this.vehicleHistoryRepo = vehicleHistoryRepo;
        this.vehicleStatusRepo = vehicleStatusRepo;
    }
    async get24HourPerformanceSummary(vehicleId) {
        const now = new Date();
        const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        this.logger.log(`Fetching 24-hour performance for vehicle ${vehicleId} from ${since.toISOString()} to ${now.toISOString()}`);
        const vehicleExists = await this.vehicleStatusRepo.findOne({
            where: { vehicleId },
        });
        if (!vehicleExists) {
            throw new common_1.NotFoundException(`Vehicle ${vehicleId} not found in system`);
        }
        const vehicleData = await this.vehicleHistoryRepo
            .createQueryBuilder('vehicle')
            .select('SUM(vehicle.kwhDeliveredDc)', 'totalDcDelivered')
            .addSelect('AVG(vehicle.batteryTemp)', 'avgBatteryTemp')
            .addSelect('COUNT(*)', 'readingsCount')
            .where('vehicle.vehicleId = :vehicleId', { vehicleId })
            .andWhere('vehicle.timestamp >= :since', { since })
            .getRawOne();
        const correlatedMeterId = this.getCorrelatedMeterId(vehicleId);
        const meterData = await this.meterHistoryRepo
            .createQueryBuilder('meter')
            .select('SUM(meter.kwhConsumedAc)', 'totalAcConsumed')
            .addSelect('COUNT(*)', 'readingsCount')
            .where('meter.meterId = :meterId', { meterId: correlatedMeterId })
            .andWhere('meter.timestamp >= :since', { since })
            .getRawOne();
        const totalDcDelivered = parseFloat(vehicleData?.totalDcDelivered) || 0;
        const totalAcConsumed = parseFloat(meterData?.totalAcConsumed) || 0;
        const avgBatteryTemp = parseFloat(vehicleData?.avgBatteryTemp) || 0;
        const efficiencyRatio = totalAcConsumed > 0 ? totalDcDelivered / totalAcConsumed : 0;
        const healthStatus = this.calculateHealthStatus(efficiencyRatio);
        this.logger.log(`Vehicle ${vehicleId}: Efficiency ${(efficiencyRatio * 100).toFixed(2)}% - ${healthStatus}`);
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
    getCorrelatedMeterId(vehicleId) {
        return vehicleId.replace('VEH-', 'METER-');
    }
    calculateHealthStatus(efficiencyRatio) {
        if (efficiencyRatio >= this.EFFICIENCY_HEALTHY) {
            return 'HEALTHY';
        }
        else if (efficiencyRatio >= this.EFFICIENCY_WARNING) {
            return 'WARNING';
        }
        else {
            return 'CRITICAL';
        }
    }
    async getFleetSummary() {
        const vehicles = await this.vehicleStatusRepo.find();
        let totalEfficiency = 0;
        let criticalCount = 0;
        let warningCount = 0;
        let healthyCount = 0;
        for (const vehicle of vehicles) {
            try {
                const summary = await this.get24HourPerformanceSummary(vehicle.vehicleId);
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
            }
            catch {
            }
        }
        return {
            totalVehicles: vehicles.length,
            averageEfficiency: vehicles.length > 0 ? totalEfficiency / vehicles.length : 0,
            criticalCount,
            warningCount,
            healthyCount,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.MeterReadingHistory)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.VehicleReadingHistory)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.VehicleStatus)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map