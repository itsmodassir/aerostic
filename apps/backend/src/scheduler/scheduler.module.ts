import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Appointment])],
    controllers: [SchedulerController],
    providers: [SchedulerService],
    exports: [SchedulerService],
})
export class SchedulerModule { }
