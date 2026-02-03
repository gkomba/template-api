import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class resendCodeDto {
  @IsString()
  @ApiProperty()
  user_id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  email: string;
}

export class verifyCodeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  otp: string;
}

export class verifyCodeResponseDto {
  @ApiProperty()
  msg: string;
}

export class resendCodeResponseDto {
  @ApiProperty()
  msg: string;
}
