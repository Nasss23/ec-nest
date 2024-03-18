import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose, { Model } from 'mongoose';
import { Brand, BrandDocument } from 'src/brand/schemas/brand.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
    @InjectModel(Brand.name)
    private brandModel: Model<BrandDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, user: IUser) {
    let category = await this.categoryModel.create({
      ...createCategoryDto,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });
    return category;
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
    const totalItems = (await this.categoryModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const data = await this.categoryModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate({
        path: 'brand',
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
      throw new BadRequestException('Không tìm thấy category');
    }
    return await this.categoryModel.findById(id);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, user: IUser) {
    let data = await this.categoryModel.updateOne(
      { _id: id },
      {
        ...updateCategoryDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return data;
  }

  async remove(id: string) {
    let results = this.categoryModel.deleteOne({
      _id: id,
    });
    await this.brandModel.deleteMany({ category: id });

    return results;
  }
}
