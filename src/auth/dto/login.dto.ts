import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'User email address' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'User password hash' })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
