import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async create(input: CreateTagInput) {
    const name = input.name.trim().toLowerCase();

    if (!name) {
      throw new BadRequestException('Tag name is required');
    }

    const existingTag = await this.prisma.tag.findUnique({
      where: { name },
    });

    if (existingTag) {
      throw new ConflictException('Tag already exists');
    }

    return this.prisma.tag.create({
      data: { name },
    });
  }

  async update(input: UpdateTagInput) {
    const name = input.name.trim().toLowerCase();

    if (!name) {
      throw new BadRequestException('Tag name is required');
    }

    const tag = await this.prisma.tag.findUnique({
      where: { id: input.id },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    const existingTagWithSameName = await this.prisma.tag.findUnique({
      where: { name },
    });

    if (existingTagWithSameName && existingTagWithSameName.id !== input.id) {
      throw new ConflictException('Another tag already uses this name');
    }

    return this.prisma.tag.update({
      where: { id: input.id },
      data: { name },
    });
  }

  async remove(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    await this.prisma.tag.delete({
      where: { id },
    });

    return true;
  }
}
