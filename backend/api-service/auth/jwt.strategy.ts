import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { JwtPayload, SystemRole } from "@shared/types/roles";

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
            token = req.cookies["access_token"];
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
      secretOrKey: configService.get<string>("JWT_SECRET") || "default_secret",
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (
      payload.tokenVersion !== undefined &&
      user.tokenVersion !== payload.tokenVersion
    ) {
      throw new UnauthorizedException("Token revoked");
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: user.name,
      role: user.role as unknown as SystemRole,
      permissions: user.permissions || [],
      tenantId: payload.tenantId,
      sessionId: payload.sessionId,
      isImpersonation: payload.isImpersonation,
      impersonatedBy: payload.impersonatedBy,
    };
  }
}
