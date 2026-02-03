import { Controller, Post, Body, UnauthorizedException, Get, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { UserRole } from '../users/entities/user.entity';
import { IsNotEmpty, IsEmail } from 'class-validator';

class LoginDto {
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;
}

class RegisterDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    workspace: string;
}

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private tenantsService: TenantsService,
    ) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        try {
            // Create tenant first
            const tenant = await this.tenantsService.create({
                name: registerDto.workspace,
            });

            // Create user with tenant
            const user = await this.usersService.create({
                email: registerDto.email,
                password: registerDto.password,
                name: registerDto.name,
                tenantId: tenant.id,
                role: UserRole.ADMIN, // First user is admin
            });

            // Return user data without password
            const { passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            console.error('Registration error details:', error);
            if (error.message?.includes('already exists') || error.message?.includes('duplicate key')) {
                throw new BadRequestException('Email already registered');
            }
            throw error;
        }
    }

    @Get('me')
    // @UseGuards(JwtAuthGuard)
    async getProfile() {
        return { id: 'current_user', email: 'admin@aerostic.com' };
    }
}
