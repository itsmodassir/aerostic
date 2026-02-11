import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    this.logger.warn(`Attempting login for: ${email}`);
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      this.logger.debug('User not found in DB');
      return null;
    }

    this.logger.warn(`User found in DB: ID=${user.id}, Email=${user.email}, Role=${user.role}`);
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    this.logger.warn(`Password match: ${isMatch}`);

    if (isMatch) {
      // Explicitly map properties to a plain object to avoid TypeORM proxies/spread issues
      const plainUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
      this.logger.warn(`Returning plain user object: ${JSON.stringify(plainUser)}`);
      return plainUser;
    }
    return null;
  }

  async login(user: any) {
    this.logger.debug(
      `Login method called with user: ${JSON.stringify(user, null, 2)}`,
    );

    if (!user || !user.email) {
      this.logger.error(`User object is invalid: ${JSON.stringify(user)}`);
      throw new Error('Invalid user object');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      tenantId: user.tenantId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }
}
