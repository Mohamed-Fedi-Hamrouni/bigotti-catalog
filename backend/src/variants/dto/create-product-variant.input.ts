import { Field, Float, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CreateProductVariantInput {
  @Field(() => ID)
  productId: string;

  @Field()
  color: string;

  @Field()
  size: string;

  @Field(() => Float)
  price: number;
}
