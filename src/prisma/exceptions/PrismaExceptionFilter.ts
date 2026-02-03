import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let message = 'Erro de base de dados';

    if (exception.code === 'P2002') {
      message = 'Valor duplicado (unique constraint)';
    }

    if (exception.code === 'P2003') {
      message = 'Relacionamento inválido';
    }

    response.status(400).json({
      statusCode: 400,
      message,
      prismaCode: exception.code,
    });
  }
}


// Errors from
// Common
// Prisma Client (Query Engine)