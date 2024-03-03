import { IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'name không được để trống ' })
  name: string;

  @IsNotEmpty({ message: 'description không được để trống ' })
  description: string;

  @IsNotEmpty({ message: 'isActive không được để trống ' })
  @IsBoolean({ message: 'isActive có giá trị boolean' })
  isActive: boolean;
}
