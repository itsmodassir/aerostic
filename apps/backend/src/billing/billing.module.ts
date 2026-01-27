import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageMetric } from './entities/usage-metric.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([UsageMetric]),
    ],
    providers: [],
    exports: [],
})
export class BillingModule { }
