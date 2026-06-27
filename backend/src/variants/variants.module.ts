import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VariantsResolver } from './variants.resolver';
import { VariantsService } from './variants.service';

@Module({
  imports: [PrismaModule],
  providers: [VariantsResolver, VariantsService],
})
export class VariantsModule {}
