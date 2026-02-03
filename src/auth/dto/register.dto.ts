import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Full name of the user' })
    name: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'User password' })
    password: string;

    @IsEmail()
    @IsOptional()
    @ApiProperty({ description: 'User email address', required: false })
    email: string;

}

export class RegisterResponseDto {
    @ApiProperty()
    tmp_token: string;

    @ApiProperty()
    msg: string;
}