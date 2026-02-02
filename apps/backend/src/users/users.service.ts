import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.usersRepository.findOneBy({ email: createUserDto.email });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(createUserDto.password, salt);

        const user = this.usersRepository.create({
            ...createUserDto,
            passwordHash,
        });

        return this.usersRepository.save(user);
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ email });
    }

    async findOne(id: string): Promise<User> {
        const user = await this.usersRepository.findOneBy({ id });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async findAllByTenant(tenantId: string): Promise<User[]> {
        return this.usersRepository.findBy({ tenantId });
    }

    async cleanupMockData(): Promise<{ deleted: number }> {
        const mockEmails = [
            'rahul@example.com',
            'priya@example.com',
            'vikram@example.com', // Just in case
            'neha@example.com',
            'ravi@example.com',
            'anjali@example.com'
        ];

        const result = await this.usersRepository
            .createQueryBuilder()
            .delete()
            .from(User)
            .where("email IN (:...emails)", { emails: mockEmails })
            .execute();

        return { deleted: result.affected || 0 };
    }
}
