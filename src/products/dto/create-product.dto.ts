export class CreateProductDto {
  name: string;

  price: string;

  slug: string;

  image: string;

  quantity: number;

  discount: number;

  sold: number;

  discountStartDate: Date;

  discountEndDate: Date;

  brand: {
    _id: string;
  };
}
