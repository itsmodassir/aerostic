import { AuthzResource, AuthzAction } from "../constants/authz.constants";

export interface Policy {
  id: string;
  subjectType: "role" | "user" | "apiKey";
  subject: string;
  resource: AuthzResource | "*";
  action: AuthzAction | "*";
  effect: "allow" | "deny";
  conditions?: Record<string, any>;
}
