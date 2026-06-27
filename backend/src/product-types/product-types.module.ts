import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductTypesResolver } from './product-types.resolver';
import { ProductTypesService } from './product-types.service';

@Module({
  imports: [PrismaModule],
  providers: [ProductTypesResolver, ProductTypesService],
})
export class ProductTypesModule {}
