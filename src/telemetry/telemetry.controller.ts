import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    HttpCode,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TelemetryService } from './telemetry.service';
import { MeterTelemetryDto, VehicleTelemetryDto } from './dto';

/**
 * Telemetry Controller
 * Polymorphic ingestion endpoints for Meter and Vehicle telemetry streams
 * Each endpoint handles 60-second heartbeat data from respective hardware
 */
@ApiTags('Telemetry')
@Controller('v1/telemetry')
export class TelemetryController {
    private readonly logger = new Logger(TelemetryController.name);

    constructor(private readonly telemetryService: TelemetryService) { }

    /**
     * POST /v1/telemetry/meter
     * Ingest Smart Meter telemetry (Grid Side)
     * Reports kwhConsumedAc - energy pulled from utility grid
     */
    @Post('meter')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Ingest Smart Meter telemetry',
        description:
            'Receives AC power consumption data from grid-side smart meters. Data is stored in both hot (current status) and cold (historical) stores.',
    })
    @ApiResponse({
        status: 201,
        description: 'Telemetry ingested successfully',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid telemetry data',
    })
    async ingestMeter(@Body() dto: MeterTelemetryDto) {
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

    /**
     * POST /v1/telemetry/vehicle
     * Ingest EV Vehicle telemetry (Vehicle Side)
     * Reports kwhDeliveredDc, SoC, and battery temperature
     */
    @Post('vehicle')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Ingest EV Vehicle telemetry',
        description:
            'Receives DC power delivery data from EV chargers including battery SoC and temperature. Data is stored in both hot (current status) and cold (historical) stores.',
    })
    @ApiResponse({
        status: 201,
        description: 'Telemetry ingested successfully',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid telemetry data',
    })
    async ingestVehicle(@Body() dto: VehicleTelemetryDto) {
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

    /**
     * GET /v1/telemetry/meter/:meterId/status
     * Get current meter status (fast lookup from hot store)
     */
    @Get('meter/:meterId/status')
    @ApiOperation({
        summary: 'Get current meter status',
        description:
            'Retrieves the latest status of a meter from the hot store. O(1) lookup time.',
    })
    @ApiParam({
        name: 'meterId',
        description: 'Unique identifier of the meter',
        example: 'METER-001',
    })
    @ApiResponse({
        status: 200,
        description: 'Current meter status',
    })
    async getMeterStatus(@Param('meterId') meterId: string) {
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

    /**
     * GET /v1/telemetry/vehicle/:vehicleId/status
     * Get current vehicle status (fast lookup from hot store)
     */
    @Get('vehicle/:vehicleId/status')
    @ApiOperation({
        summary: 'Get current vehicle status',
        description:
            'Retrieves the latest status of a vehicle from the hot store including SoC and battery temp. O(1) lookup time.',
    })
    @ApiParam({
        name: 'vehicleId',
        description: 'Unique identifier of the vehicle',
        example: 'VEH-001',
    })
    @ApiResponse({
        status: 200,
        description: 'Current vehicle status',
    })
    async getVehicleStatus(@Param('vehicleId') vehicleId: string) {
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
}
