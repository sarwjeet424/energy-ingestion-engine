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
var TelemetryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
let TelemetryService = TelemetryService_1 = class TelemetryService {
    meterHistoryRepo;
    meterStatusRepo;
    vehicleHistoryRepo;
    vehicleStatusRepo;
    logger = new common_1.Logger(TelemetryService_1.name);
    constructor(meterHistoryRepo, meterStatusRepo, vehicleHistoryRepo, vehicleStatusRepo) {
        this.meterHistoryRepo = meterHistoryRepo;
        this.meterStatusRepo = meterStatusRepo;
        this.vehicleHistoryRepo = vehicleHistoryRepo;
        this.vehicleStatusRepo = vehicleStatusRepo;
    }
    async ingestMeterReading(dto) {
        const timestamp = new Date(dto.timestamp);
        const historyRecord = this.meterHistoryRepo.create({
            meterId: dto.meterId,
            kwhConsumedAc: dto.kwhConsumedAc,
            voltage: dto.voltage,
            timestamp,
        });
        const savedHistory = await this.meterHistoryRepo.save(historyRecord);
        this.logger.debug(`Meter ${dto.meterId}: Saved history record ${savedHistory.id}`);
        await this.meterStatusRepo.upsert({
            meterId: dto.meterId,
            kwhConsumedAc: dto.kwhConsumedAc,
            voltage: dto.voltage,
            lastReading: timestamp,
        }, {
            conflictPaths: ['meterId'],
            skipUpdateIfNoValuesChanged: true,
        });
        this.logger.debug(`Meter ${dto.meterId}: Upserted status`);
        return {
            historyId: savedHistory.id,
            statusUpdated: true,
        };
    }
    async ingestVehicleReading(dto) {
        const timestamp = new Date(dto.timestamp);
        const historyRecord = this.vehicleHistoryRepo.create({
            vehicleId: dto.vehicleId,
            soc: dto.soc,
            kwhDeliveredDc: dto.kwhDeliveredDc,
            batteryTemp: dto.batteryTemp,
            timestamp,
        });
        const savedHistory = await this.vehicleHistoryRepo.save(historyRecord);
        this.logger.debug(`Vehicle ${dto.vehicleId}: Saved history record ${savedHistory.id}`);
        await this.vehicleStatusRepo.upsert({
            vehicleId: dto.vehicleId,
            soc: dto.soc,
            kwhDeliveredDc: dto.kwhDeliveredDc,
            batteryTemp: dto.batteryTemp,
            lastReading: timestamp,
        }, {
            conflictPaths: ['vehicleId'],
            skipUpdateIfNoValuesChanged: true,
        });
        this.logger.debug(`Vehicle ${dto.vehicleId}: Upserted status`);
        return {
            historyId: savedHistory.id,
            statusUpdated: true,
        };
    }
    async getMeterStatus(meterId) {
        return this.meterStatusRepo.findOne({ where: { meterId } });
    }
    async getVehicleStatus(vehicleId) {
        return this.vehicleStatusRepo.findOne({ where: { vehicleId } });
    }
};
exports.TelemetryService = TelemetryService;
exports.TelemetryService = TelemetryService = TelemetryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.MeterReadingHistory)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.MeterStatus)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.VehicleReadingHistory)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.VehicleStatus)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TelemetryService);
//# sourceMappingURL=telemetry.service.js.map