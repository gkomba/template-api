
import { Body, Controller, Post, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './Decorators/auth.public';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { ApiTags, ApiProperty, ApiResponse  } from '@nestjs/swagger';
import { resendCodeDto, resendCodeResponseDto, verifyCodeDto, verifyCodeResponseDto } from './dto/code.dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() 
  @ApiResponse({ type: LoginResponseDto, status: 201, description: 'User logged in successfully.' })
  @Post('login')
  async login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Public()
  @Post('register')
  @ApiResponse({ type: RegisterResponseDto, status: 201, description: 'User registered successfully.' })
  async register(@Body() req: RegisterDto) {
    return this.authService.register(req);
  }

  @Public()
  @Post('refresh')
  async refresh(@Request() req) {
    return this.authService.refreshToken(req.body.refresh_token);
  }

  @Public()
  @Post('verify-code')
  @ApiResponse({ type: verifyCodeResponseDto, status: 200, description: 'Verification code verified successfully.' })
  async verifyAccount(@Body() data: verifyCodeDto) {
    return this.authService.verifyAccount(data);
  }

  @Get('resend-code')
  @ApiResponse({ type: resendCodeResponseDto, status: 200, description: 'Verification code resent successfully.' })
  async resendCode(@Body() data: resendCodeDto) {
    return this.authService.resendCode(data);
  }
}