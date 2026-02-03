import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpstashService } from '../upstash/upstash.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';
import 'dotenv/config';
import { resendCodeDto, verifyCodeDto } from './dto/code.dtos';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const REFRESH_WINDOW_DAYS = 15;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private upstashService: UpstashService,
    private jwtService: JwtService,
  ) {}


  private async findAndValidateUser(email: string, password: string): Promise<any | null> {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(userData: LoginDto) {
    if (!(userData.email && userData.password)) {
      throw new HttpException('Email e Senha sao obrigatorios', HttpStatus.BAD_REQUEST);
    }

    const user = await this.findAndValidateUser(userData.email, userData.password);
    if (!user) {
      throw new UnauthorizedException('Email ou Senha invalidos');
    }


    const payload = {
      nome_completo: user.nome_completo,
      email: user.email,
      sub: user.id,
      tipo_usuario: user.tipo_usuario,
      status_usuario: user.status,
    };

    const jti = uuidv4();
    try {
      await this.prisma.authtokens.create({
        data: {
          id: jti,
          user_id: user.id,
          createdAt: new Date(),
          expiresAt: new Date(new Date().getTime() + 90 * MS_PER_DAY),
          revoked: false,
          revokedAt: null,
          lastUsedAt: new Date(),
          device: 'Unknown',
          userAgent: 'Unknown',
        },
      });
    } catch (err) {
      console.error('Erro ao salvar o token de autenticação:', err);
    }

    const refreshPayload = { sub: user.id, jti: jti };

    const token = this.jwtService.sign(payload, { expiresIn: '30d' });
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: '90d',
    });

    return {
      access_token: token,
      refresh_token: refreshToken,
    };
  }

  async register(userData: RegisterDto) {

    if (userData.email) {
      const emailExists = await this.prisma.users.findFirst({
        where: { email: userData.email },
      });
      if (emailExists) {
        throw new BadRequestException('Email Ja cadastrado');
      }
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);
    userData.password = passwordHash;
  
    try {
      const newUser = await this.prisma.$transaction(async (tx) => {
        const createID = uuidv4();
        const newUser = await tx.users.create({
          data: {
            id: createID,
            name: userData.name,
            email: userData.email,
            password: userData.password,
            updatedAt: new Date(),
          },
        });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await tx.otp.create({
          data: {
            id: newUser.id,
            user_id: newUser.id,
            otp: otp,
            createdAt: new Date(),
            expiresAt: new Date(new Date().getTime() + 10 * 60000),
          },
        });

        if (newUser.email) {
          this.upstashService.SendOTP_email({
            name: newUser.name,
            otp: otp,
            to: newUser.email,
          });
        }
        return newUser;
      });

      const tmp_token = await this.jwtService.signAsync(
        { id: newUser.id, email: newUser.email, action: 'register' },
        { expiresIn: '15m' },
      );

      return {
        tmp_token: tmp_token,
        msg: 'Usuario registrado com sucesso',
      };
    } catch (err) {
      throw new HttpException('Erro ao registrar usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async refreshToken(token: string) {
    try {
      const payload: any = await this.jwtService.verifyAsync(token);

      const tokenRecord = await this.prisma.authtokens.findUnique({
        where: { id: payload.jti },
      });
      if (!tokenRecord || tokenRecord.revoked) {
        throw new UnauthorizedException('Refresh token revoked or not found');
      }

      const User = await this.prisma.users.findUnique({
        where: { id: payload.sub },
      });
      if (!User) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = {
        name: User.name,
        sub: User.id,
      };

      const newToken = this.jwtService.sign(newPayload, { expiresIn: '30d' });

      const now = new Date().getTime();
      const timeLeft = tokenRecord.expiresAt.getTime() - now;
      if (timeLeft < REFRESH_WINDOW_DAYS * MS_PER_DAY) {
        const newJti = uuidv4();
        await this.prisma.authtokens.create({
          data: {
            id: newJti,
            user_id: User.id,
            createdAt: new Date(),
            expiresAt: new Date(new Date().getTime() + 90 * MS_PER_DAY),
            revoked: false,
            revokedAt: null,
            lastUsedAt: new Date(),
            device: 'Unknown',
            userAgent: 'Unknown',
          },
        });

        await this.prisma.authtokens.update({
          where: { id: payload.jti },
          data: { revoked: true, revokedAt: new Date() },
        });

        const refreshPayload = { sub: User.id, jti: newJti };
        const newRefreshToken = this.jwtService.sign(refreshPayload, {
          expiresIn: '90d',
        });

        return {
          access_token: newToken,
          refresh_token: newRefreshToken,
        };
      }

      try {
        await this.prisma.authtokens.update({
          where: { id: payload.jti },
          data: { lastUsedAt: new Date() },
        });
      } catch (err) {
        console.error('Erro ao atualizar o token de autenticação:', err);
      }

      return {
        access_token: newToken,
      };
    } catch (err) {
      throw new HttpException('Invalid or expired refresh token', HttpStatus.UNAUTHORIZED);
    }
  }

  async verifyAccount(otpCode: verifyCodeDto) {
    const otpRecord = await this.prisma.otp.findFirst({
      where: { otp: otpCode.otp },
    });
  
    if (!otpRecord) {
      throw new HttpException('OTP invalido', HttpStatus.BAD_REQUEST);
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new HttpException('OTP expirado', HttpStatus.BAD_REQUEST);
    }

    // Caso queira atualizar o status do usuário para aprovado, descomente o código abaixo e ajuste conforme necessário
    // await this.prisma.users.update({
    //   where: { id: otpRecord.user_id },
    //   data: { status: status_usuario.APROVADO },
    // });

    await this.prisma.otp.deleteMany({
      where: { user_id: otpRecord.user_id },
    });

    return {
      msg: 'Conta verificada com sucesso',
      code_msg: 'Verified',
    };
  }

  async resendCode(data : resendCodeDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: data.user_id  }
    });
    if (!user) {
      throw new HttpException('Usuario nao encontrado', HttpStatus.NOT_FOUND);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.otp.upsert({
      where: { id: user.id },
      update: {
        otp: otp,
        createdAt: new Date(),
        expiresAt: new Date(new Date().getTime() + 10 * 60000),
      },
      create: {
        id: user.id,
        user_id: user.id,
        otp: otp,
        createdAt: new Date(),
        expiresAt: new Date(new Date().getTime() + 10 * 60000),
      },
    });

      this.upstashService.SendOTP_email({
        name: user.name,
        otp: otp,
        to: data.email,
      });

    return {
      msg: 'Codigo de verificacao reenviado com sucesso',
    };
  }
}
