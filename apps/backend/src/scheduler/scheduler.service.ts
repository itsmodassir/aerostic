import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class SchedulerService {
    constructor(
        @InjectRepository(Appointment)
        private appointmentRepository: Repository<Appointment>,
    ) { }

    async create(createDto: CreateAppointmentDto, tenantId: string): Promise<Appointment> {
        const appointment = this.appointmentRepository.create({
            ...createDto,
            tenantId,
            startTime: new Date(createDto.startTime),
            endTime: new Date(createDto.endTime),
        });
        return this.appointmentRepository.save(appointment);
    }

    async findAll(tenantId: string): Promise<Appointment[]> {
        return this.appointmentRepository.find({
            where: { tenantId },
            relations: ['contact', 'agent'],
            order: { startTime: 'ASC' },
        });
    }

    async findOne(id: string, tenantId: string): Promise<Appointment> {
        const appointment = await this.appointmentRepository.findOne({
            where: { id, tenantId },
            relations: ['contact', 'agent'],
        });
        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }
        return appointment;
    }

    async update(id: string, tenantId: string, updateData: Partial<Appointment>): Promise<Appointment> {
        const appointment = await this.findOne(id, tenantId);
        Object.assign(appointment, updateData);
        if (updateData.startTime) appointment.startTime = new Date(updateData.startTime);
        if (updateData.endTime) appointment.endTime = new Date(updateData.endTime);
        return this.appointmentRepository.save(appointment);
    }

    async remove(id: string, tenantId: string): Promise<void> {
        const appointment = await this.findOne(id, tenantId);
        await this.appointmentRepository.remove(appointment);
    }
}
