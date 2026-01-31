import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
    MeterReadingHistory,
    MeterStatus,
    VehicleReadingHistory,
    VehicleStatus,
} from './entities';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DATABASE_HOST', 'localhost'),
                port: configService.get<number>('DATABASE_PORT', 5432),
                username: configService.get('DATABASE_USERNAME', 'postgres'),
                password: configService.get('DATABASE_PASSWORD', 'postgres'),
                database: configService.get('DATABASE_NAME', 'energy_db'),
                entities: [
                    MeterReadingHistory,
                    MeterStatus,
                    VehicleReadingHistory,
                    VehicleStatus,
                ],
                synchronize: true, // Auto-create tables in development
                logging: process.env.NODE_ENV === 'development',
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([
            MeterReadingHistory,
            MeterStatus,
            VehicleReadingHistory,
            VehicleStatus,
        ]),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule { }
