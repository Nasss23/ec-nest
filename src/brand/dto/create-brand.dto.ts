export class CreateBrandDto {
  name: string;

  description: string;

  category: {
    _id: string;
  };

  product: string[];
}
