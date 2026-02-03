import {
    CanActivate,
    Injectable,
    ExecutionContext,
    UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../Decorators/auth.public';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }
        const token = authHeader.split(' ')[1];
        try {
            const payload = await this.jwtService.verifyAsync(token);
            const user = await this.prisma.users.findUnique({ where: { id: payload.sub } });
            if (!user) {
                throw new UnauthorizedException('User not found');
            }
            request.user = user;
            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}