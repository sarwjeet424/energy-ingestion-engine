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
var AnalyticsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_1 = require("./analytics.service");
let AnalyticsController = AnalyticsController_1 = class AnalyticsController {
    analyticsService;
    logger = new common_1.Logger(AnalyticsController_1.name);
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getVehiclePerformance(vehicleId) {
        this.logger.log(`Fetching 24-hour performance for vehicle ${vehicleId}`);
        const summary = await this.analyticsService.get24HourPerformanceSummary(vehicleId);
        return {
            success: true,
            data: summary,
        };
    }
    async getFleetSummary() {
        this.logger.log('Fetching fleet-wide analytics summary');
        const summary = await this.analyticsService.getFleetSummary();
        return {
            success: true,
            data: summary,
        };
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('performance/:vehicleId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get 24-hour vehicle performance',
        description: `Returns a comprehensive 24-hour performance summary for a vehicle including:
- Total AC energy consumed from grid
- Total DC energy delivered to battery
- Efficiency ratio (DC/AC) - indicates power loss
- Average battery temperature
- Health status: HEALTHY (≥85%), WARNING (70-85%), CRITICAL (<70%)`,
    }),
    (0, swagger_1.ApiParam)({
        name: 'vehicleId',
        description: 'Unique identifier of the vehicle',
        example: 'VEH-001',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '24-hour performance summary',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Vehicle not found',
    }),
    __param(0, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getVehiclePerformance", null);
__decorate([
    (0, common_1.Get)('fleet'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get fleet-wide analytics',
        description: 'Returns aggregated analytics across all vehicles including total count, average efficiency, and health status breakdown.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Fleet-wide analytics summary',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getFleetSummary", null);
exports.AnalyticsController = AnalyticsController = AnalyticsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, common_1.Controller)('v1/analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map