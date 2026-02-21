import { AuthzResource, AuthzAction } from "../constants/authz.constants";

export interface AuthorizeMetadata {
  resource: AuthzResource | string;
  action: AuthzAction | string;
  resourceIdParam?: string;
}

export interface AuthorizationContext {
  user?: any;
  apiKey?: any;
  resource: string;
  action: string;
  tenantId: string;
}

export interface CompiledAuthzState {
  userId: string;
  tenantId: string;
  role: string;
  permissions: string[];
  resellerScope: string[];
  riskScore: number;
  plan: string;
  subscriptionStatus: string;
}
