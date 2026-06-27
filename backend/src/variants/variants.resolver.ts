import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { ProductVariantModel } from './product-variant.model';
import { VariantsService } from './variants.service';
import { CreateProductVariantInput } from './dto/create-product-variant.input';
import { UpdateProductVariantInput } from './dto/update-product-variant.input';
import { UpdateVariantPriceInput } from './dto/update-variant-price.input';

@Resolver(() => ProductVariantModel)
export class VariantsResolver {
  constructor(private readonly variantsService: VariantsService) {}

  @Mutation(() => ProductVariantModel)
  createProductVariant(@Args('input') input: CreateProductVariantInput) {
    return this.variantsService.create(input);
  }

  @Mutation(() => ProductVariantModel)
  updateProductVariant(@Args('input') input: UpdateProductVariantInput) {
    return this.variantsService.update(input);
  }

  @Mutation(() => ProductVariantModel)
  updateVariantPrice(@Args('input') input: UpdateVariantPriceInput) {
    return this.variantsService.updatePrice(input);
  }

  @Mutation(() => Boolean)
  deleteProductVariant(@Args('id', { type: () => ID }) id: string) {
    return this.variantsService.remove(id);
  }
}
