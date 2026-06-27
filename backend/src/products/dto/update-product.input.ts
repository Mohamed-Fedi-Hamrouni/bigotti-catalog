import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateProductInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  ref?: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => ID, { nullable: true })
  typeId?: string;

  @Field(() => [ID], { nullable: true })
  tagIds?: string[];
}
