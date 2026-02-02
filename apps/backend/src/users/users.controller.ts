import { Controller, Post, Body, Get, Param, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // Usually protected by Super Admin guard
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll(@Query('tenantId') tenantId: string) {
        // Fallback to query param if not using subdomains yet
        return this.usersService.findAllByTenant(tenantId);
    }
}
