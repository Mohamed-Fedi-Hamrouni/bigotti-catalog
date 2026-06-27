import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductTypeModel } from './product-type.model';
import { ProductTypesService } from './product-types.service';
import { CreateProductTypeInput } from './dto/create-product-type.input';
import { UpdateProductTypeInput } from './dto/update-product-type.input';

@Resolver(() => ProductTypeModel)
export class ProductTypesResolver {
  constructor(private readonly productTypesService: ProductTypesService) {}

  @Query(() => [ProductTypeModel])
  productTypes() {
    return this.productTypesService.findAll();
  }

  @Query(() => ProductTypeModel)
  productType(@Args('id', { type: () => ID }) id: string) {
    return this.productTypesService.findOne(id);
  }

  @Mutation(() => ProductTypeModel)
  createProductType(@Args('input') input: CreateProductTypeInput) {
    return this.productTypesService.create(input);
  }

  @Mutation(() => ProductTypeModel)
  updateProductType(@Args('input') input: UpdateProductTypeInput) {
    return this.productTypesService.update(input);
  }

  @Mutation(() => Boolean)
  deleteProductType(@Args('id', { type: () => ID }) id: string) {
    return this.productTypesService.remove(id);
  }
}
