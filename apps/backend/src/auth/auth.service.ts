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

    console.log(
      `[AuthDebug] User found in DB: ID=${user.id}, Email=${user.email}, Role=${user.role}`,
    );
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    console.log(`[AuthDebug] Password match: ${isMatch}`);

    if (isMatch) {
      // Explicitly map properties to a plain object to avoid TypeORM proxies/spread issues
      const plainUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
      console.log(
        '[AuthDebug] Returning plain user object:',
        JSON.stringify(plainUser),
      );
      return plainUser;
    }
    return null;
  }

  async login(user: any) {
    console.log(
      '[AuthDebug] Login method called with user:',
      JSON.stringify(user, null, 2),
    );

    if (!user || !user.email) {
      console.error('[AuthDebug] User object is invalid:', user);
      throw new Error('Invalid user object');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
