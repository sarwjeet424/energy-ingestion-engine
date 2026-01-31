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
exports.VehicleReadingHistory = void 0;
const typeorm_1 = require("typeorm");
let VehicleReadingHistory = class VehicleReadingHistory {
    id;
    vehicleId;
    soc;
    kwhDeliveredDc;
    batteryTemp;
    timestamp;
    createdAt;
};
exports.VehicleReadingHistory = VehicleReadingHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VehicleReadingHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], VehicleReadingHistory.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], VehicleReadingHistory.prototype, "soc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4 }),
    __metadata("design:type", Number)
], VehicleReadingHistory.prototype, "kwhDeliveredDc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 6, scale: 2 }),
    __metadata("design:type", Number)
], VehicleReadingHistory.prototype, "batteryTemp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], VehicleReadingHistory.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], VehicleReadingHistory.prototype, "createdAt", void 0);
exports.VehicleReadingHistory = VehicleReadingHistory = __decorate([
    (0, typeorm_1.Entity)('vehicle_readings_history'),
    (0, typeorm_1.Index)(['vehicleId', 'timestamp'])
], VehicleReadingHistory);
//# sourceMappingURL=vehicle-reading-history.entity.js.map