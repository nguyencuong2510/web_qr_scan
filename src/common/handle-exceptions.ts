import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { ValidationError } from 'class-validator';
import { ApiError, ApiResult } from './classes';

const handleException = (exception: HttpException | Error, logger: Logger) => {
  const apiResult = new ApiResult<any>();
  apiResult.error(exception.message, exception['status']);
  if (exception instanceof ApiError) {
    apiResult.data = exception.data;
    apiResult.message = exception.message;
    apiResult.errorCode = exception.message;
  } else if (exception instanceof BadRequestException) {
    const errors = exception.message;
    if (
      Array.isArray(errors) &&
      errors.length > 0 &&
      errors[0] instanceof ValidationError
    ) {
      const messages = errors.map((error: ValidationError) => {
        const errorMsg = error.constraints
          ? error.constraints[Object.keys(error.constraints)[0]]
          : error.toString();

        logger.error(`Error !!!`);
        logger.error(errorMsg);
      });

      apiResult.message = messages.join('\n');
    }
  } else if (exception instanceof HttpException) {
    apiResult.message = exception.message;
  } else if (typeof exception.message === 'object') {
    apiResult.message = exception.message;
  }

  return apiResult;
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(this.constructor.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const apiResult = handleException(exception, this.logger);

    this.logger.error(apiResult.message, {
      requestUrl: request.url,
      request: request.body,
      exception,
    });

    if (exception instanceof (UnauthorizedException || ForbiddenException)) {
      return response.status(exception.getStatus()).json({ ...apiResult });
    }

    return response.status(200).json({ ...apiResult });
  }
}
