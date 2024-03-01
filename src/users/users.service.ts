import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  getHashPassword = (password: string) => {
    let salt = genSaltSync(10);
    let hash = hashSync(password, salt);
    return hash;
  };
  async create(createUserDto: CreateUserDto) {
    const hashPassword = this.getHashPassword(createUserDto.password);
    let user = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
    });
    return user;
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Không tìm thấy user';
    let user = await this.userModel.findById({
      _id: id,
    });
    return user;
  }

  async findOneByUsername(username: string) {
    let user = await this.userModel.findOne({
      email: username,
    });
    return user;
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(updateUserDto: UpdateUserDto) {
    let user = await this.userModel.updateOne(
      {
        _id: updateUserDto._id,
      },
      { ...updateUserDto },
    );
    return user;
  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Không tìm thấy user';
    let user = await this.userModel.deleteOne({
      _id: id,
    });
    return user;
  }
}