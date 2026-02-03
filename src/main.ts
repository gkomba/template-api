import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

function formatErrors(errors: any[]): any {
  const result = {};
  errors.forEach((err) => {
    if (err.children && err.children.length > 0) {
      result[err.property] = formatErrors(err.children);
    } else if (err.constraints) {
      result[err.property] = Object.values(err.constraints).join(', ');
    }
  });
  return result;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Segurança HTTP com Helmet
  app.use(helmet());

  // Configuração de proxy (se necessário)
  app.set('trust proxy', 'loopback');

  // Habilitar CORS
  app.enableCors();

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formatted = formatErrors(errors);
        return new BadRequestException({
          statusCode: 400,
          message: 'Erro de validação',
          errors: formatted,
        });
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('AgriConnect API')
    .setDescription('Documentação da API Para Produtores e Motoristas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('docs', app, document);
    app.getHttpAdapter().get('/docs-json', (req, res: Request) => {
      return document;
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
