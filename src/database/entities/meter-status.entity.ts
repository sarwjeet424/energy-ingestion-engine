import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Operational (Hot) Store for Current Meter Status
 * Single row per meter - UPSERT target for fast dashboard queries
 * Ensures O(1) lookups for current meter state
 */
@Entity('meter_status')
export class MeterStatus {
    @PrimaryColumn({ type: 'varchar', length: 100 })
    meterId: string;

    @Column({ type: 'decimal', precision: 12, scale: 4 })
    kwhConsumedAc: number;

    @Column({ type: 'decimal', precision: 8, scale: 2 })
    voltage: number;

    @Column({ type: 'timestamp with time zone' })
    lastReading: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    lastUpdated: Date;
}
