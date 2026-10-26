import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { TokenPayload } from "@everpride/auth";
import { AuthenticatedUserRequest } from "../guards/auth.guard.js";

export const CurrentUser = createParamDecorator(
  (data: keyof TokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedUserRequest>();
    const user = request.user;
    return data ? user?.[data] : user;
  }
);
