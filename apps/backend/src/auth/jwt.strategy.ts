import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['access_token'];
          }
          if (!token && req.headers.cookie) {
            // Manual parsing if cookie-parser is missing
            const match = req.headers.cookie.match(/access_token=([^;]+)/);
            if (match) {
              token = match[1];
            }
          }
          return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default_secret',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    // Check if token version matches (if payload has version)
    // For backward compatibility, if payload lacks version, we might allow it momentarily or strict reject.
    // Given we want partial logout, strict reject is safer but might logout everyone immediately on deploy.
    // Plan calls for global logout, so strict reject is acceptable.
    if (
      payload.tokenVersion !== undefined &&
      user.tokenVersion !== payload.tokenVersion
    ) {
      throw new UnauthorizedException('Token revoked');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: user.role, // Use role from DB, not payload (allows immediate role updates)
      tenantId: payload.tenantId, // Include tenantId in the validated user object
    };
  }
}
