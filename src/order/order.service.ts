import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import mongoose, { Model } from 'mongoose';
import { IUser } from 'src/users/users.interface';
import { CartDocument } from 'src/carts/schemas/cart.schema';
import aqp from 'api-query-params';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(Order.name)
    private cartModel: Model<CartDocument>,
  ) {}
  async create(createOrderDto: CreateOrderDto, user: IUser) {
    let order = await this.orderModel.create({
      ...createOrderDto,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });

    return order;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.orderModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const data = await this.orderModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate({
        path: 'cart',
        populate: {
          path: 'product',
        },
      })
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      data, //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Không tìm thấy Order');
    }
    return await this.orderModel.findById(id);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, user: IUser) {
    let data = await this.orderModel.updateOne(
      { _id: id },
      {
        ...updateOrderDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return data;
  }

  async remove(id: string) {
    let results = await this.orderModel.deleteOne({
      _id: id,
    });
    return results;
  }
}
