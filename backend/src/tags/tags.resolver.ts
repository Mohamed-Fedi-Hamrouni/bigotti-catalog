import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TagModel } from './tag.model';
import { TagsService } from './tags.service';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';

@Resolver(() => TagModel)
export class TagsResolver {
  constructor(private readonly tagsService: TagsService) {}

  @Query(() => [TagModel])
  tags() {
    return this.tagsService.findAll();
  }

  @Query(() => TagModel)
  tag(@Args('id', { type: () => ID }) id: string) {
    return this.tagsService.findOne(id);
  }

  @Mutation(() => TagModel)
  createTag(@Args('input') input: CreateTagInput) {
    return this.tagsService.create(input);
  }

  @Mutation(() => TagModel)
  updateTag(@Args('input') input: UpdateTagInput) {
    return this.tagsService.update(input);
  }

  @Mutation(() => Boolean)
  deleteTag(@Args('id', { type: () => ID }) id: string) {
    return this.tagsService.remove(id);
  }
}
