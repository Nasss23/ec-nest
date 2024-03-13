import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';
import mongoose, { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class CartsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(Cart.name)
    private cartModel: Model<CartDocument>,
  ) {}

  async create(createCartDto: CreateCartDto, user: IUser) {
    let cart = await this.cartModel.create({
      ...createCartDto,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });

    // if (createCartDto.product) {
    //   const product = await this.productModel.findById(createCartDto.product);
    //   await product.updateOne({ $push: { product: product?._id } });
    // }
    return cart;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.cartModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const data = await this.cartModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate({
        path: 'product',
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
      throw new BadRequestException('Không tìm thấy brand');
    }
    return await this.cartModel.findById(id);
  }

  async update(id: string, updateCartDto: UpdateCartDto, user: IUser) {
    let data = await this.cartModel.updateOne(
      { _id: id },
      {
        ...updateCartDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return data;
  }

  async remove(id: string) {
    let results = await this.cartModel.deleteOne({
      _id: id,
    });

    return results;
  }
}
