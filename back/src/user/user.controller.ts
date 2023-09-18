import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from "@type/user.dto";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers() {
    return await this.userService.getAll();
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getById(id);
  }

  /*
  ** TODO: Add a 'developement' Guard for these routes, so that they can only be accessed in development mode.
  */
  @Post()
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  async createOrUpdateUser(@Body() data: UserDto) {
    return await this.userService.createOrUpdate(data);
  }

  @Delete(':id')
  async deleteUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.delete(id);
  }
}
