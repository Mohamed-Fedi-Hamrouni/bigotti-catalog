import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PriceHistoryResolver } from './price-history.resolver';
import { PriceHistoryService } from './price-history.service';

@Module({
  imports: [PrismaModule],
  providers: [PriceHistoryResolver, PriceHistoryService],
})
export class PriceHistoryModule {}
