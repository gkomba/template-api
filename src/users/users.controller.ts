import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/auth/Decorators/user.request';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('me')
  update(@User('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Get('me')
  findOne(@User('id') id: string) {
    console.log('User ID from token:', id);
    return this.usersService.findOne(id);
  }

  @Delete('me')
  remove(@User('id') id: string) {
    return this.usersService.remove(id);
  }
}
