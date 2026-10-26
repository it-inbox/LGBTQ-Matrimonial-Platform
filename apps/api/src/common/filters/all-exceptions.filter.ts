import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response, Request } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (
      exception &&
      typeof exception === "object" &&
      "name" in exception &&
      (exception as any).name === "PrismaClientInitializationError"
    ) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: "Database service is unreachable. Please verify PostgreSQL is running at the configured DATABASE_URL.",
        error: "Service Unavailable",
      };
      this.logger.error(`Database connection error: ${(exception as any).message}`);
    } else {
      this.logger.error("Unhandled exception occurred", exception);
    }

    const payload =
      typeof message === "string"
        ? {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
          }
        : {
            timestamp: new Date().toISOString(),
            path: request.url,
            ...(message as object),
          };

    response.status(status).json(payload);
  }
}
