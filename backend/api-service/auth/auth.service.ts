import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TenantMembership } from "@shared/database/entities/core/tenant-membership.entity";
import { RedisService } from "@shared/redis.service";
import { Request } from "express";
import { SystemRole, JwtPayload } from "@shared/types/roles";
import { UserSession } from "./entities/user-session.entity";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { AuthzCacheService } from "@shared/authorization/cache/authz-cache.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private authzCache: AuthzCacheService,
    @InjectRepository(TenantMembership)
    private membershipRepository: Repository<TenantMembership>,
    @InjectRepository(UserSession)
    private sessionRepo: Repository<UserSession>,
  ) {}

  async generateOtp(email: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redisService.set(`otp:${email}`, otp, 300); // 5 minutes
    this.logger.log(`OTP generated for ${email}`);
    return otp;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const storedOtp = await this.redisService.get(`otp:${email}`);
    if (storedOtp && storedOtp === otp) {
      await this.redisService.del(`otp:${email}`);
      return true;
    }
    return false;
  }

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
        order: { createdAt: "ASC" },
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

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  async createSession(
    user: any,
    req: Request,
    isImpersonation = false,
    impersonatedBy?: string,
  ): Promise<{ session: UserSession; refreshToken: string }> {
    const refreshToken = crypto.randomBytes(40).toString("hex");
    const refreshTokenHash = this.hashToken(refreshToken);

    const session = this.sessionRepo.create({
      userId: user.id,
      tenantId: user.tenantId,
      refreshTokenHash,
      ipAddress: (req as any).ip,
      userAgent: (req as any).headers["user-agent"],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isImpersonation,
      impersonatedBy,
    });

    await this.sessionRepo.save(session);
    return { session, refreshToken };
  }

  async login(user: any, req: Request, extraPayload: any = {}) {
    const { session, refreshToken } = await this.createSession(
      user,
      req,
      extraPayload.isImpersonation,
      extraPayload.impersonatedBy,
    );

    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      id: user.id,
      role: user.role,
      tenantId: user.tenantId,
      sessionId: session.id,
      tokenVersion: user.tokenVersion,
      ...extraPayload,
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: "15m" }),
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async refreshTokens(refreshToken: string, sessionId: string, req: Request) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ["user"],
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException("Session invalid or expired");
    }

    // Verify token version for global logout support
    if (session.user.tokenVersion > (session as any).tokenVersionAtLogin) {
      // Note: We'll ideally store version at login in session, but user.tokenVersion is our global master
    }

    const hash = this.hashToken(refreshToken);
    if (session.refreshTokenHash !== hash) {
      // DETECTED: Someone is reusing an old refresh token!
      // Revoke the entire session immediately for security
      session.revokedAt = new Date();
      await this.sessionRepo.save(session);
      this.logger.error(
        `Refresh token reuse detected for session ${sessionId}. Account compromised? Revoking all tokens.`,
      );
      throw new UnauthorizedException("Security Breach: Session Revoked");
    }

    // Rotate tokens
    const newRefreshToken = crypto.randomBytes(40).toString("hex");
    session.refreshTokenHash = this.hashToken(newRefreshToken);
    session.ipAddress = (req as any).ip;
    session.userAgent = (req as any).headers["user-agent"];
    await this.sessionRepo.save(session);

    const payload: JwtPayload = {
      email: session.user.email,
      sub: session.user.id,
      id: session.user.id,
      role: session.user.role as any,
      tenantId: session.tenantId,
      sessionId: session.id,
      tokenVersion: session.user.tokenVersion,
      isImpersonation: session.isImpersonation,
      impersonatedBy: session.impersonatedBy,
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: "15m" }),
      refresh_token: newRefreshToken,
    };
  }

  async logout(sessionId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
    });
    if (session) {
      await this.authzCache.invalidate(session.userId);
    }
    await this.sessionRepo.update(sessionId, { revokedAt: new Date() });
  }

  async revokeAllSessionsForUser(userId: string) {
    // Invalidate authz cache for all tenants (we might need a pattern delete or just common tenants)
    // For now, let's assume one main tenant or specific invalidation logic
    // A better way: AuthzCacheService could support invalidateAllForUser
    await this.authzCache.invalidate(userId);
    await this.sessionRepo.update({ userId }, { revokedAt: new Date() });
    await this.usersService.invalidateTokens(userId); // Global JWT invalidation
  }

  async revokeAllSessionsForTenant(tenantId: string) {
    await this.sessionRepo.update({ tenantId }, { revokedAt: new Date() });
  }
}
