import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const UserTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      targetTenantId?: string;
      user?: { tenantId?: string };
    }>();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const rawHeaderId = request.headers["x-tenant-id"];
    const headerId = Array.isArray(rawHeaderId) ? rawHeaderId[0] : rawHeaderId;
    const targetTenantId = request.targetTenantId;
    const jwtTenantId = request.user?.tenantId;

    if (typeof headerId === "string" && uuidRegex.test(headerId)) {
      return headerId;
    }
    if (typeof targetTenantId === "string" && uuidRegex.test(targetTenantId)) {
      return targetTenantId;
    }
    if (typeof jwtTenantId === "string" && uuidRegex.test(jwtTenantId)) {
      return jwtTenantId;
    }

    return jwtTenantId;
  },
);
