import { SetMetadata, CustomDecorator } from "@nestjs/common";
import { AuthorizeMetadata } from "../interfaces/authorization-context.interface";

export const AUTHORIZE_KEY = "authz_metadata";

export const Authorize = (metadata: AuthorizeMetadata): CustomDecorator =>
  SetMetadata(AUTHORIZE_KEY, metadata);
