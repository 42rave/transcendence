import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UserDto } from "@type/user.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: UserDto) {
    return await this.prisma.users.create({ data });
  }

  async getAll() {
    return await this.prisma.users.findMany();
  }

  async getById(id: number) {
    return await this.prisma.users.findUnique({ where: { id: id } });
  }

  async update(data: UserDto) {
    return await this.prisma.users.update({ where: { id: data.id }, data });
  }

  async delete(id: number) {
    return await this.prisma.users.delete({ where: { id } });
  }

  async createOrUpdate(data: UserDto) {
    const user = await this.prisma.users.findUnique({ where: { id: data.id } });
    if (user) {
      return await this.prisma.users.update({ where: { id: data.id }, data });
    } else {
      return await this.prisma.users.create({ data });
    }
  }
}
