import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { UpstashService } from 'src/upstash/upstash.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecretKey',
      signOptions: {
        expiresIn: '30d',
      },
    }),
  ],
  providers: [AuthService, AuthGuard, PrismaService, UpstashService],
  exports: [AuthService, AuthGuard, JwtModule, PrismaService],
})
export class AuthModule {}