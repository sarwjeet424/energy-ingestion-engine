"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const args = process.argv.slice(2);
const getArg = (name, defaultValue) => {
    const index = args.indexOf(`--${name}`);
    return index !== -1 ? parseInt(args[index + 1], 10) : defaultValue;
};
const NUM_VEHICLES = getArg('vehicles', 5);
const NUM_HOURS = getArg('hours', 2);
const READINGS_PER_HOUR = 60;
const MIN_EFFICIENCY = 0.70;
const MAX_EFFICIENCY = 0.92;
async function sendTelemetry(endpoint, data) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.ok;
    }
    catch (error) {
        console.error(`Failed to send telemetry: ${error}`);
        return false;
    }
}
function generateCorrelatedReadings(vehicleId, timestamp) {
    const meterId = vehicleId.replace('VEH-', 'METER-');
    const kwhConsumedAc = 0.1 + Math.random() * 0.15;
    const efficiency = MIN_EFFICIENCY + Math.random() * (MAX_EFFICIENCY - MIN_EFFICIENCY);
    const kwhDeliveredDc = kwhConsumedAc * efficiency;
    const voltage = 230 + Math.random() * 20;
    const batteryTemp = 25 + Math.random() * 15;
    const socIncrease = (kwhDeliveredDc / 60) * 100;
    return {
        meter: {
            meterId,
            kwhConsumedAc: Math.round(kwhConsumedAc * 10000) / 10000,
            voltage: Math.round(voltage * 100) / 100,
            timestamp: timestamp.toISOString(),
        },
        vehicle: {
            vehicleId,
            soc: Math.min(100, Math.round(socIncrease * 100) / 100),
            kwhDeliveredDc: Math.round(kwhDeliveredDc * 10000) / 10000,
            batteryTemp: Math.round(batteryTemp * 100) / 100,
            timestamp: timestamp.toISOString(),
        },
    };
}
async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('       Energy Ingestion Engine - Test Data Generator');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Configuration:`);
    console.log(`  • Vehicles: ${NUM_VEHICLES}`);
    console.log(`  • Hours of data: ${NUM_HOURS}`);
    console.log(`  • Readings per hour: ${READINGS_PER_HOUR}`);
    console.log(`  • Total readings: ${NUM_VEHICLES * NUM_HOURS * READINGS_PER_HOUR * 2}`);
    console.log(`  • API URL: ${BASE_URL}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    try {
        const healthCheck = await fetch(`${BASE_URL}`);
        if (!healthCheck.ok) {
            console.error('❌ API is not responding. Make sure the server is running.');
            process.exit(1);
        }
        console.log('✅ API is available\n');
    }
    catch {
        console.error('❌ Cannot connect to API. Make sure the server is running.');
        console.error(`   Try: cd energy-ingestion-engine && npm run start:dev\n`);
        process.exit(1);
    }
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    const now = new Date();
    const startDate = new Date(now.getTime() - NUM_HOURS * 60 * 60 * 1000);
    console.log(`Generating data from ${startDate.toISOString()} to ${now.toISOString()}\n`);
    for (let v = 1; v <= NUM_VEHICLES; v++) {
        const vehicleId = `VEH-${v.toString().padStart(3, '0')}`;
        console.log(`Processing ${vehicleId}...`);
        let timestamp = new Date(startDate);
        const readingsPerVehicle = NUM_HOURS * READINGS_PER_HOUR;
        for (let r = 0; r < readingsPerVehicle; r++) {
            const { meter, vehicle } = generateCorrelatedReadings(vehicleId, timestamp);
            const meterSuccess = await sendTelemetry('/v1/telemetry/meter', meter);
            const vehicleSuccess = await sendTelemetry('/v1/telemetry/vehicle', vehicle);
            if (meterSuccess && vehicleSuccess) {
                successCount += 2;
            }
            else {
                errorCount += meterSuccess ? 1 : 2;
                errorCount += vehicleSuccess ? 0 : 1;
            }
            timestamp = new Date(timestamp.getTime() + 60 * 1000);
            if ((r + 1) % 60 === 0) {
                process.stdout.write(`.`);
            }
        }
        console.log(` ✓`);
    }
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('                        SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  ✅ Successful: ${successCount} readings`);
    console.log(`  ❌ Failed: ${errorCount} readings`);
    console.log(`  ⏱️  Duration: ${duration} seconds`);
    console.log(`  📊 Rate: ${(successCount / parseFloat(duration)).toFixed(0)} readings/sec`);
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('Next steps:');
    console.log('  1. Check analytics for any vehicle:');
    console.log(`     curl ${BASE_URL}/v1/analytics/performance/VEH-001`);
    console.log('  2. Check current status:');
    console.log(`     curl ${BASE_URL}/v1/telemetry/vehicle/VEH-001/status`);
    console.log('  3. Check fleet summary:');
    console.log(`     curl ${BASE_URL}/v1/analytics/fleet`);
}
main().catch(console.error);
//# sourceMappingURL=generate-test-data.js.map