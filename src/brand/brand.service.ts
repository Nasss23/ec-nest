import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Brand, BrandDocument } from './schemas/brand.schema';
import mongoose, { Model } from 'mongoose';
import { IUser } from 'src/users/users.interface';
import {
  Category,
  CategoryDocument,
} from 'src/category/schemas/category.schema';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';
import aqp from 'api-query-params';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name)
    private brandModel: Model<BrandDocument>,

    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,

    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}
  async create(createBrandDto: CreateBrandDto, user: IUser) {
    let brand = await this.brandModel.create({
      ...createBrandDto,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });
    if (createBrandDto.category) {
      const category = await this.categoryModel.findById(
        createBrandDto.category,
      );
      await category.updateOne({ $push: { brand: brand?._id } });
    }
    return brand;
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
    const totalItems = (await this.brandModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const data = await this.brandModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate({
        path: 'category',
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
    return await this.brandModel.findById(id);
  }

  async update(id: string, updateBrandDto: UpdateBrandDto, user: IUser) {
    let data = await this.brandModel.updateOne(
      { _id: id },
      {
        ...updateBrandDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return data;
  }

  async remove(id: string) {
    let results = await this.brandModel.deleteOne({
      _id: id,
    });
    await this.categoryModel.updateMany({}, { $pull: { brand: id } });
    await this.productModel.deleteMany({ brand: id });
    return results;
  }
}
