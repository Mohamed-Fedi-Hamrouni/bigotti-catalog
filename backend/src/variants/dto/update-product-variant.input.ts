import { Field, Float, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateProductVariantInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  size?: string;

  @Field(() => Float, { nullable: true })
  price?: number;
}
