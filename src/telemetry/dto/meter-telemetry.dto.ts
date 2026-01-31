import {
    IsString,
    IsNumber,
    IsDateString,
    IsNotEmpty,
    Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for Smart Meter telemetry ingestion
 * Validates 60-second heartbeat data from grid-side meters
 */
export class MeterTelemetryDto {
    @ApiProperty({
        description: 'Unique identifier for the smart meter',
        example: 'METER-001',
    })
    @IsString()
    @IsNotEmpty()
    meterId: string;

    @ApiProperty({
        description: 'AC energy consumed from the utility grid (kWh)',
        example: 150.5,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    kwhConsumedAc: number;

    @ApiProperty({
        description: 'Voltage reading from the meter (V)',
        example: 240,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    voltage: number;

    @ApiProperty({
        description: 'ISO 8601 timestamp of the reading',
        example: '2026-01-31T14:00:00Z',
    })
    @IsDateString()
    timestamp: string;
}
