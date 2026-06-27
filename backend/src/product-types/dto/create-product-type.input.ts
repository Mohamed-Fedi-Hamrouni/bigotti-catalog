import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateProductTypeInput {
  @Field()
  name: string;
}
