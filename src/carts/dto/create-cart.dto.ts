export class CreateCartDto {
  quantity: number;
  product: { _id: string };
  user: {
    _id: string;
  };
}
