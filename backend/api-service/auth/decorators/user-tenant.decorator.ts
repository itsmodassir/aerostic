import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const UserTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const headerId = request.headers["x-tenant-id"] || request.targetTenantId;
    return headerId || request.user?.tenantId;
  },
);
