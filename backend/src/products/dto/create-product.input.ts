import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CreateProductInput {
  @Field()
  ref: string;

  @Field()
  name: string;

  @Field(() => ID)
  typeId: string;

  @Field(() => [ID], { nullable: true })
  tagIds?: string[];
}
