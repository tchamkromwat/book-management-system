import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        const exceptionResponse = exception.getResponse();
        const message = typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).message || exception.message;

        const errorResponse = {
            success: false,
            message: Array.isArray(message) ? message[0] : message,
            error: {
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
            },
        };

        // Log error details (skip favicon requests to reduce noise)
        if (!(request.url === '/favicon.ico' && status === 404)) {
            this.logger.error(
                `${request.method} ${request.url} - ${status} - ${JSON.stringify(message)}`,
            );
        }

        response.status(status).json(errorResponse);
    }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = exception instanceof HttpException
            ? exception.message
            : 'Internal server error';

        const errorResponse = {
            success: false,
            message,
            error: {
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
            },
        };

        this.logger.error(
            `${request.method} ${request.url} - ${status} - ${message}`,
            exception instanceof Error ? exception.stack : undefined,
        );

        response.status(status).json(errorResponse);
    }
} 