import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60, // segundos
          limit: 10,
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
