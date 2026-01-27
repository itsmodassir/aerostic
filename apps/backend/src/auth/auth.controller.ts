import { Controller, Post, Body, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsNotEmpty } from 'class-validator';

class LoginDto {
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;
}

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }
    @Post('register')
    async register(@Body() body: any) {
        // Registration logic
        return { id: 'new_user_id', email: body.email };
    }

    @Get('me')
    // @UseGuards(JwtAuthGuard)
    async getProfile() {
        return { id: 'current_user', email: 'admin@aerostic.com' };
    }
}
