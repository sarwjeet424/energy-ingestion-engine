import { Controller, Get, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AnalyticsService, PerformanceSummary } from './analytics.service';

/**
 * Analytics Controller
 * Provides analytical endpoints for power efficiency and vehicle performance
 */
@ApiTags('Analytics')
@Controller('v1/analytics')
export class AnalyticsController {
    private readonly logger = new Logger(AnalyticsController.name);

    constructor(private readonly analyticsService: AnalyticsService) { }

    /**
     * GET /v1/analytics/performance/:vehicleId
     * Returns 24-hour performance summary including:
     * - Total energy consumed (AC) vs. delivered (DC)
     * - Efficiency Ratio (DC/AC)
     * - Average battery temperature
     * - Health status based on efficiency thresholds
     */
    @Get('performance/:vehicleId')
    @ApiOperation({
        summary: 'Get 24-hour vehicle performance',
        description: `Returns a comprehensive 24-hour performance summary for a vehicle including:
- Total AC energy consumed from grid
- Total DC energy delivered to battery
- Efficiency ratio (DC/AC) - indicates power loss
- Average battery temperature
- Health status: HEALTHY (≥85%), WARNING (70-85%), CRITICAL (<70%)`,
    })
    @ApiParam({
        name: 'vehicleId',
        description: 'Unique identifier of the vehicle',
        example: 'VEH-001',
    })
    @ApiResponse({
        status: 200,
        description: '24-hour performance summary',
    })
    @ApiResponse({
        status: 404,
        description: 'Vehicle not found',
    })
    async getVehiclePerformance(
        @Param('vehicleId') vehicleId: string,
    ): Promise<{
        success: boolean;
        data: PerformanceSummary;
    }> {
        this.logger.log(`Fetching 24-hour performance for vehicle ${vehicleId}`);

        const summary =
            await this.analyticsService.get24HourPerformanceSummary(vehicleId);

        return {
            success: true,
            data: summary,
        };
    }

    /**
     * GET /v1/analytics/fleet
     * Returns fleet-wide analytics summary
     */
    @Get('fleet')
    @ApiOperation({
        summary: 'Get fleet-wide analytics',
        description:
            'Returns aggregated analytics across all vehicles including total count, average efficiency, and health status breakdown.',
    })
    @ApiResponse({
        status: 200,
        description: 'Fleet-wide analytics summary',
    })
    async getFleetSummary() {
        this.logger.log('Fetching fleet-wide analytics summary');

        const summary = await this.analyticsService.getFleetSummary();

        return {
            success: true,
            data: summary,
        };
    }
}
