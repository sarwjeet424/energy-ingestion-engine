import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Index,
    CreateDateColumn,
} from 'typeorm';

/**
 * Historical (Cold) Store for Vehicle Readings
 * Append-only table for audit trail and long-term reporting
 * Stores SoC, DC energy delivered, and battery temperature for analytics
 */
@Entity('vehicle_readings_history')
@Index(['vehicleId', 'timestamp']) // Composite index for efficient 24-hour analytics queries
export class VehicleReadingHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    @Index() // Secondary index for device-specific queries
    vehicleId: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    soc: number; // State of Charge (0-100%)

    @Column({ type: 'decimal', precision: 12, scale: 4 })
    kwhDeliveredDc: number;

    @Column({ type: 'decimal', precision: 6, scale: 2 })
    batteryTemp: number;

    @Column({ type: 'timestamp with time zone' })
    timestamp: Date;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;
}
