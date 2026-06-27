import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateProductTypeInput } from './dto/create-product-type.input';
import { UpdateProductTypeInput } from './dto/update-product-type.input';

@Injectable()
export class ProductTypesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<ProductType[]> {
    return this.prisma.productType.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<ProductType> {
    const productType = await this.prisma.productType.findUnique({
      where: { id },
    });

    if (!productType) {
      throw new NotFoundException('Product type not found');
    }

    return productType;
  }

  async create(input: CreateProductTypeInput): Promise<ProductType> {
    const name = this.normalizeName(input.name);

    const existingType = await this.prisma.productType.findUnique({
      where: { name },
    });

    if (existingType) {
      throw new ConflictException('Product type already exists');
    }

    return this.prisma.productType.create({
      data: { name },
    });
  }

  async update(input: UpdateProductTypeInput): Promise<ProductType> {
    const name = this.normalizeName(input.name);

    const productType = await this.prisma.productType.findUnique({
      where: { id: input.id },
    });

    if (!productType) {
      throw new NotFoundException('Product type not found');
    }

    const existingTypeWithSameName = await this.prisma.productType.findUnique({
      where: { name },
    });

    if (existingTypeWithSameName && existingTypeWithSameName.id !== input.id) {
      throw new ConflictException(
        'Another product type already uses this name',
      );
    }

    return this.prisma.productType.update({
      where: { id: input.id },
      data: { name },
    });
  }

  async remove(id: string): Promise<boolean> {
    const productType = await this.prisma.productType.findUnique({
      where: { id },
    });

    if (!productType) {
      throw new NotFoundException('Product type not found');
    }

    const productsCount = await this.prisma.product.count({
      where: {
        typeId: id,
      },
    });

    if (productsCount > 0) {
      throw new BadRequestException(
        'Cannot delete a product type that is used by products',
      );
    }

    await this.prisma.productType.delete({
      where: { id },
    });

    return true;
  }

  private normalizeName(name: string): string {
    const normalizedName = name.trim();

    if (!normalizedName) {
      throw new BadRequestException('Product type name is required');
    }

    return normalizedName;
  }
}
