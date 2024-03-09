export class CreateBrandDto {
  name: string;

  description: string;

  image: string;

  category: {
    _id: string;
  };

  product: string[];
}
