import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

/**
 * Historical (Cold) Store for Meter Readings
 * Append-only table for audit trail and long-term reporting
 * Optimized for write-heavy ingestion with indexed time-range queries
 */
@Entity('meter_readings_history')
@Index(['meterId', 'timestamp']) // Composite index for efficient 24-hour analytics queries
export class MeterReadingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index() // Secondary index for device-specific queries
  meterId: string;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  kwhConsumedAc: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  voltage: number;

  @Column({ type: 'timestamp with time zone' })
  timestamp: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
