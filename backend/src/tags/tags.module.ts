import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TagsResolver } from './tags.resolver';
import { TagsService } from './tags.service';

@Module({
  imports: [PrismaModule],
  providers: [TagsResolver, TagsService],
})
export class TagsModule {}
