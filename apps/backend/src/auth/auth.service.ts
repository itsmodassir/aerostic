import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantMembership } from '../tenants/entities/tenant-membership.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(TenantMembership)
    private membershipRepository: Repository<TenantMembership>,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    this.logger.warn(`Attempting login for: ${email}`);
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);

    if (isMatch) {
      // Resolve the primary tenantId for the user
      const membership = await this.membershipRepository.findOne({
        where: { userId: user.id },
        order: { createdAt: 'ASC' }
      });

      const plainUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: membership?.tenantId, // Include tenantId
        tokenVersion: user.tokenVersion,
      };
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
      tokenVersion: user.tokenVersion,
    };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '30d' }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async logout(userId: string) {
    if (userId) {
      await this.usersService.invalidateTokens(userId);
    }
  }
}
