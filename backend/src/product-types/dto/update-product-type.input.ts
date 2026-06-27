import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateProductTypeInput {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}
