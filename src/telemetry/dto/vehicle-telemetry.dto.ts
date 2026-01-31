import {
    IsString,
    IsNumber,
    IsDateString,
    IsNotEmpty,
    Min,
    Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for EV Vehicle telemetry ingestion
 * Validates 60-second heartbeat data from vehicle-side chargers
 */
export class VehicleTelemetryDto {
    @ApiProperty({
        description: 'Unique identifier for the vehicle',
        example: 'VEH-001',
    })
    @IsString()
    @IsNotEmpty()
    vehicleId: string;

    @ApiProperty({
        description: 'State of Charge - Battery percentage (0-100%)',
        example: 75,
        minimum: 0,
        maximum: 100,
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    soc: number; // State of Charge (Battery %)

    @ApiProperty({
        description: 'DC energy delivered to the battery (kWh)',
        example: 127.5,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    kwhDeliveredDc: number;

    @ApiProperty({
        description: 'Battery temperature in Celsius',
        example: 32,
    })
    @IsNumber()
    batteryTemp: number;

    @ApiProperty({
        description: 'ISO 8601 timestamp of the reading',
        example: '2026-01-31T14:00:00Z',
    })
    @IsDateString()
    timestamp: string;
}
