import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { IUser } from 'src/users/users.interface';
import { Brand, BrandDocument } from 'src/brand/schemas/brand.schema';
import aqp from 'api-query-params';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(Brand.name)
    private brandModel: Model<BrandDocument>,
  ) {}
  async create(createProductDto: CreateProductDto, user: IUser) {
    let product = await this.productModel.create({
      ...createProductDto,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });

    if (createProductDto.brand) {
      const brand = await this.brandModel.findById(createProductDto.brand);
      await brand.updateOne({ $push: { product: product?._id } });
    }
    return product;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);

    if (filter.name) {
      filter.name = { $regex: new RegExp(filter.name, 'i') };
    }
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.productModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const data = await this.productModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate({
        path: 'brand',
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
      throw new BadRequestException('Không tìm thấy product');
    }
    return await this.productModel.findById(id);
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: IUser) {
    let data = await this.productModel.updateOne(
      { _id: id },
      {
        ...updateProductDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return data;
  }

  async remove(id: string) {
    let data = await this.productModel.deleteOne({
      _id: id,
    });

    await this.brandModel.updateOne(
      {},
      { $pull: { product: id } }, // Xóa id khỏi mảng brands
    );
    return data;
  }
}
