import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UserDto } from '@type/user.dto';
import { PaginationDto } from '@type/pagination.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: UserDto) {
    return await this.prisma.user.create({ data });
  }

  async getAll(pagination: PaginationDto) {
    return await this.prisma.user.findMany(pagination as Object);
  }

  async getById(id: number) {
    return await this.prisma.user.findUnique({ where: { id: id } });
  }

  async update(data: UserDto) {
    return await this.prisma.user.update({ where: { id: data.id }, data });
  }

  async delete(id: number) {
    return await this.prisma.user.delete({ where: { id } });
  }

  async createOrUpdate(data: UserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: data.id } });
    if (user) {
      return await this.prisma.user.update({ where: { id: data.id }, data });
    } else {
      return await this.prisma.user.create({ data });
    }
  }
}
