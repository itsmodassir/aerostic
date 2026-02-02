import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        console.log(`[AuthDebug] Attempting login for: ${email}`);
        const user = await this.usersService.findOneByEmail(email);

        if (!user) {
            console.log('[AuthDebug] User not found in DB');
            return null;
        }

        console.log(`[AuthDebug] User found: ${user.id}, Role: ${user.role}`);
        const isMatch = await bcrypt.compare(pass, user.passwordHash);
        console.log(`[AuthDebug] Password match: ${isMatch}`);

        if (isMatch) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, tenantId: user.tenantId, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
