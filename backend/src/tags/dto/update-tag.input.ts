import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateTagInput {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}
