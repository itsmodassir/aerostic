export enum AuthzResource {
  TENANT = "tenant",
  USER = "user",
  API_KEY = "apiKey",
  CAMPAIGN = "campaign",
  MESSAGE = "message",
  TEMPLATE = "template",
  CONTACT = "contact",
  AUTOMATION = "automation",
  BILLING = "billing",
  RESELLER = "reseller",
  AUDIT = "audit",
  SYSTEM = "system",
}

export enum AuthzAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  EXECUTE = "execute",
  MANAGE = "manage",
  GRANT = "grant",
  REVOKE = "revoke",
}

export const AUTHZ_CACHE_PREFIX = "authz:state:";
export const AUTHZ_CACHE_TTL = 900; // 15 minutes
