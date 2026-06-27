import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProductVariantModel {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  productId: string;

  @Field()
  color: string;

  @Field()
  size: string;

  @Field(() => Float)
  price: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
