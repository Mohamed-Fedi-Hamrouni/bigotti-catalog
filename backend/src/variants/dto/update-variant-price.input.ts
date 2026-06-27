import { Field, Float, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateVariantPriceInput {
  @Field(() => ID)
  variantId: string;

  @Field(() => Float)
  newPrice: number;

  @Field(() => ID, { nullable: true })
  changedByUserId?: string;
}
