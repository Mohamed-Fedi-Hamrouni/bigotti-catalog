import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { PriceHistoryModel } from './price-history.model';
import { PriceHistoryService } from './price-history.service';

@Resolver(() => PriceHistoryModel)
export class PriceHistoryResolver {
  constructor(private readonly priceHistoryService: PriceHistoryService) {}

  @Query(() => [PriceHistoryModel])
  priceHistory() {
    return this.priceHistoryService.findAll();
  }

  @Query(() => [PriceHistoryModel])
  priceHistoryByVariant(
    @Args('variantId', { type: () => ID }) variantId: string,
  ) {
    return this.priceHistoryService.findByVariant(variantId);
  }
}
