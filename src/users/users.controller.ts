import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @ResponseMessage('Create a new user')
  async create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    let results = await this.usersService.create(createUserDto, user);

    return {
      _id: results?._id,
      createdAt: results?.createdAt,
    };
  }

  @Public()
  @Get()
  @ResponseMessage('Get all user')
  findAll(
    @Query('page') currentPage: string,
    @Query('limit') limit: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Get user by id')
  async findOne(@Param('id') id: string) {
    const results = await this.usersService.findOne(id);
    return results;
  }

  @Patch()
  @ResponseMessage('Update user')
  async update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    let results = await this.usersService.update(updateUserDto, user);
    return results;
  }

  @Delete(':id')
  @ResponseMessage('Delete user')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }
}
