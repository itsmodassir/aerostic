import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import * as Sentry from "@sentry/nestjs";

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Report to Sentry if it's a 500 or unknown error
    if (httpStatus >= 500 || !(exception instanceof HttpException)) {
      Sentry.captureException(exception);
    }

    const response = (exception instanceof HttpException)
      ? exception.getResponse()
      : (exception as any)?.message || "Internal server error";

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: typeof response === 'object' && (response as any).message ? (response as any).message : response,
      details: typeof response === 'object' ? response : undefined
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
