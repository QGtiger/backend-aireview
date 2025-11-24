import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const res =
      exception instanceof HttpException
        ? (exception.getResponse() as any)
        : exception;

    const code = exception.getStatus?.() || (exception as any).code || 500;

    const errorResponse = {
      success: false,
      message: res.message?.join
        ? res.message.join(', ')
        : res.message || exception.message,
      code,
    };

    response.status(200).json(errorResponse);
  }
}
