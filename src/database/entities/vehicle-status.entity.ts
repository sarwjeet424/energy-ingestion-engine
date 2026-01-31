import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Operational (Hot) Store for Current Vehicle Status
 * Single row per vehicle - UPSERT target for fast dashboard queries
 * Ensures O(1) lookups for current SoC, charging state, and battery info
 */
@Entity('vehicle_status')
export class VehicleStatus {
    @PrimaryColumn({ type: 'varchar', length: 100 })
    vehicleId: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    soc: number; // State of Charge (0-100%)

    @Column({ type: 'decimal', precision: 12, scale: 4 })
    kwhDeliveredDc: number;

    @Column({ type: 'decimal', precision: 6, scale: 2 })
    batteryTemp: number;

    @Column({ type: 'timestamp with time zone' })
    lastReading: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    lastUpdated: Date;
}
