import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductModel } from './product.model';
import { ProductsService } from './products.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';

@Resolver(() => ProductModel)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Query(() => [ProductModel])
  products() {
    return this.productsService.findAll();
  }

  @Query(() => ProductModel)
  product(@Args('id', { type: () => ID }) id: string) {
    return this.productsService.findOne(id);
  }

  @Query(() => [ProductModel])
  searchProducts(@Args('keyword') keyword: string) {
    return this.productsService.search(keyword);
  }

  @Mutation(() => ProductModel)
  createProduct(@Args('input') input: CreateProductInput) {
    return this.productsService.create(input);
  }

  @Mutation(() => ProductModel)
  updateProduct(@Args('input') input: UpdateProductInput) {
    return this.productsService.update(input);
  }

  @Mutation(() => Boolean)
  deleteProduct(@Args('id', { type: () => ID }) id: string) {
    return this.productsService.remove(id);
  }
}
