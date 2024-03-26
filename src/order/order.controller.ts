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
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @User() user: IUser) {
    return this.orderService.create(createOrderDto, user);
  }

  @Get()
  @Public()
  @ResponseMessage('Find all orders')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.orderService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Find order by id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a order')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @User() user: IUser,
  ) {
    return this.orderService.update(id, updateOrderDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a order')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
