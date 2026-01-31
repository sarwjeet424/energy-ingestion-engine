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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeterTelemetryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class MeterTelemetryDto {
    meterId;
    kwhConsumedAc;
    voltage;
    timestamp;
}
exports.MeterTelemetryDto = MeterTelemetryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the smart meter',
        example: 'METER-001',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MeterTelemetryDto.prototype, "meterId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'AC energy consumed from the utility grid (kWh)',
        example: 150.5,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], MeterTelemetryDto.prototype, "kwhConsumedAc", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Voltage reading from the meter (V)',
        example: 240,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], MeterTelemetryDto.prototype, "voltage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ISO 8601 timestamp of the reading',
        example: '2026-01-31T14:00:00Z',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], MeterTelemetryDto.prototype, "timestamp", void 0);
//# sourceMappingURL=meter-telemetry.dto.js.map