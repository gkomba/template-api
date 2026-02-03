import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class UsersService {
  constructor(readonly prisma: PrismaService) {}

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    console.log('Finding user with id:', id);
    return this.prisma.users.findUnique({ where: { id }
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
