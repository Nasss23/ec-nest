export class CreateProductDto {
  name: string;
  price: string;

  brand: {
    _id: string;
  };
}
