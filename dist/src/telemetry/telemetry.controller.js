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
var TelemetryController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const telemetry_service_1 = require("./telemetry.service");
const dto_1 = require("./dto");
let TelemetryController = TelemetryController_1 = class TelemetryController {
    telemetryService;
    logger = new common_1.Logger(TelemetryController_1.name);
    constructor(telemetryService) {
        this.telemetryService = telemetryService;
    }
    async ingestMeter(dto) {
        this.logger.log(`Ingesting meter reading for ${dto.meterId}`);
        const result = await this.telemetryService.ingestMeterReading(dto);
        return {
            success: true,
            message: 'Meter telemetry ingested successfully',
            data: {
                historyId: result.historyId,
                meterId: dto.meterId,
                timestamp: dto.timestamp,
            },
        };
    }
    async ingestVehicle(dto) {
        this.logger.log(`Ingesting vehicle reading for ${dto.vehicleId}`);
        const result = await this.telemetryService.ingestVehicleReading(dto);
        return {
            success: true,
            message: 'Vehicle telemetry ingested successfully',
            data: {
                historyId: result.historyId,
                vehicleId: dto.vehicleId,
                timestamp: dto.timestamp,
            },
        };
    }
    async getMeterStatus(meterId) {
        this.logger.log(`Getting status for meter ${meterId}`);
        const status = await this.telemetryService.getMeterStatus(meterId);
        if (!status) {
            return {
                success: false,
                message: `Meter ${meterId} not found`,
                data: null,
            };
        }
        return {
            success: true,
            data: status,
        };
    }
    async getVehicleStatus(vehicleId) {
        this.logger.log(`Getting status for vehicle ${vehicleId}`);
        const status = await this.telemetryService.getVehicleStatus(vehicleId);
        if (!status) {
            return {
                success: false,
                message: `Vehicle ${vehicleId} not found`,
                data: null,
            };
        }
        return {
            success: true,
            data: status,
        };
    }
};
exports.TelemetryController = TelemetryController;
__decorate([
    (0, common_1.Post)('meter'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Ingest Smart Meter telemetry',
        description: 'Receives AC power consumption data from grid-side smart meters. Data is stored in both hot (current status) and cold (historical) stores.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Telemetry ingested successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid telemetry data',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.MeterTelemetryDto]),
    __metadata("design:returntype", Promise)
], TelemetryController.prototype, "ingestMeter", null);
__decorate([
    (0, common_1.Post)('vehicle'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Ingest EV Vehicle telemetry',
        description: 'Receives DC power delivery data from EV chargers including battery SoC and temperature. Data is stored in both hot (current status) and cold (historical) stores.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Telemetry ingested successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid telemetry data',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.VehicleTelemetryDto]),
    __metadata("design:returntype", Promise)
], TelemetryController.prototype, "ingestVehicle", null);
__decorate([
    (0, common_1.Get)('meter/:meterId/status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current meter status',
        description: 'Retrieves the latest status of a meter from the hot store. O(1) lookup time.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'meterId',
        description: 'Unique identifier of the meter',
        example: 'METER-001',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Current meter status',
    }),
    __param(0, (0, common_1.Param)('meterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TelemetryController.prototype, "getMeterStatus", null);
__decorate([
    (0, common_1.Get)('vehicle/:vehicleId/status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current vehicle status',
        description: 'Retrieves the latest status of a vehicle from the hot store including SoC and battery temp. O(1) lookup time.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'vehicleId',
        description: 'Unique identifier of the vehicle',
        example: 'VEH-001',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Current vehicle status',
    }),
    __param(0, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TelemetryController.prototype, "getVehicleStatus", null);
exports.TelemetryController = TelemetryController = TelemetryController_1 = __decorate([
    (0, swagger_1.ApiTags)('Telemetry'),
    (0, common_1.Controller)('v1/telemetry'),
    __metadata("design:paramtypes", [telemetry_service_1.TelemetryService])
], TelemetryController);
//# sourceMappingURL=telemetry.controller.js.map