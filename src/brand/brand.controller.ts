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
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @ResponseMessage('Create a brand')
  create(@Body() createBrandDto: CreateBrandDto, @User() user: IUser) {
    return this.brandService.create(createBrandDto, user);
  }

  @Get()
  @Public()
  @ResponseMessage('Find all brands')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.brandService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Find brand by id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a brand')
  update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @User() user: IUser,
  ) {
    return this.brandService.update(id, updateBrandDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a brand')
  remove(@Param('id') id: string) {
    return this.brandService.remove(id);
  }
}
