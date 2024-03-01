import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { User as UserDecorator } from '../decorator/customize';
import { IUser } from './users.interface';
import aqp from 'api-query-params';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  getHashPassword = (password: string) => {
    let salt = genSaltSync(10);
    let hash = hashSync(password, salt);
    return hash;
  };

  async create(createUserDto: CreateUserDto, @UserDecorator() user: IUser) {
    const { email } = createUserDto;
    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email ${email} đã tồn tại`);
    }
    const hashPassword = this.getHashPassword(createUserDto.password);
    let results = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });
    return results;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.page;
    delete filter.limit;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Không tìm thấy user';
    let user = await this.userModel
      .findById({
        _id: id,
      })
      .select('-password');
    return user;
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({
      email: username,
    });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(updateUserDto: UpdateUserDto, @UserDecorator() user: IUser) {
    let results = await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user?._id,
          email: user?.email,
        },
      },
    );
    return results;
  }

  async remove(id: string, @UserDecorator() user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Không tìm thấy user';
    await this.userModel.updateOne(
      {
        _id: id,
      },
      {
        deletedBy: {
          _id: user?._id,
          email: user?.email,
        },
      },
    );

    return await this.userModel.deleteOne({
      _id: id,
    });
  }

  //Tạo tài khoản người dùng
  async register(user: RegisterUserDto) {
    const { name, email, password } = user;
    const hashPassword = this.getHashPassword(password);

    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email ${email} đã tồn tại`);
    }

    let newRegister = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      role: 'USER',
    });

    return newRegister;
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      {
        _id,
      },
      {
        refreshToken,
      },
    );
  };

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({
      refreshToken,
    });
  };
}
