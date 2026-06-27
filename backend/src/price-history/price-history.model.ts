import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PriceHistoryModel {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  variantId: string;

  @Field(() => Float)
  oldPrice: number;

  @Field(() => Float)
  newPrice: number;

  @Field()
  changedAt: Date;

  @Field(() => ID, { nullable: true })
  changedByUserId?: string;
}
