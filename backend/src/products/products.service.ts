import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const products = await this.prisma.product.findMany({
      include: this.productInclude(),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products.map((product) => this.mapProduct(product));
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: this.productInclude(),
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapProduct(product);
  }

  async search(keyword: string) {
    const searchTerm = keyword.trim();

    if (!searchTerm) {
      return this.findAll();
    }

    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          { ref: { contains: searchTerm, mode: 'insensitive' } },
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { type: { name: { contains: searchTerm, mode: 'insensitive' } } },
          {
            variants: {
              some: {
                OR: [
                  { color: { contains: searchTerm, mode: 'insensitive' } },
                  { size: { contains: searchTerm, mode: 'insensitive' } },
                ],
              },
            },
          },
          {
            tags: {
              some: {
                tag: {
                  name: {
                    contains: searchTerm.toLowerCase(),
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
        ],
      },
      include: this.productInclude(),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products.map((product) => this.mapProduct(product));
  }

  async create(input: CreateProductInput) {
    const ref = this.normalizeRequired(
      input.ref,
      'Product reference is required',
    );
    const name = this.normalizeRequired(input.name, 'Product name is required');

    await this.ensureProductTypeExists(input.typeId);

    const existingProduct = await this.prisma.product.findUnique({
      where: { ref },
    });

    if (existingProduct) {
      throw new ConflictException('Product reference already exists');
    }

    if (input.tagIds?.length) {
      await this.ensureTagsExist(input.tagIds);
    }

    const product = await this.prisma.product.create({
      data: {
        ref,
        name,
        typeId: input.typeId,
        tags: input.tagIds?.length
          ? {
              create: input.tagIds.map((tagId) => ({
                tag: {
                  connect: { id: tagId },
                },
              })),
            }
          : undefined,
      },
      include: this.productInclude(),
    });

    return this.mapProduct(product);
  }

  async update(input: UpdateProductInput) {
    const product = await this.prisma.product.findUnique({
      where: { id: input.id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const ref = input.ref
      ? this.normalizeRequired(input.ref, 'Product reference is required')
      : undefined;

    const name = input.name
      ? this.normalizeRequired(input.name, 'Product name is required')
      : undefined;

    if (input.typeId) {
      await this.ensureProductTypeExists(input.typeId);
    }

    if (ref && ref !== product.ref) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { ref },
      });

      if (existingProduct) {
        throw new ConflictException('Product reference already exists');
      }
    }

    if (input.tagIds) {
      await this.ensureTagsExist(input.tagIds);

      await this.prisma.productTag.deleteMany({
        where: {
          productId: input.id,
        },
      });
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id: input.id },
      data: {
        ref,
        name,
        typeId: input.typeId,
        tags: input.tagIds
          ? {
              create: input.tagIds.map((tagId) => ({
                tag: {
                  connect: { id: tagId },
                },
              })),
            }
          : undefined,
      },
      include: this.productInclude(),
    });

    return this.mapProduct(updatedProduct);
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return true;
  }

  private productInclude() {
    return {
      type: true,
      variants: {
        orderBy: [{ color: 'asc' as const }, { size: 'asc' as const }],
      },
      tags: {
        include: {
          tag: true,
        },
      },
      images: {
        orderBy: {
          position: 'asc' as const,
        },
      },
    };
  }

  private mapProduct(product: any) {
    return {
      ...product,
      variants: product.variants.map((variant: any) => ({
        ...variant,
        price: Number(variant.price),
      })),
      tags: product.tags.map((productTag: any) => productTag.tag),
      images: product.images,
    };
  }

  private normalizeRequired(value: string, errorMessage: string) {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new BadRequestException(errorMessage);
    }

    return normalizedValue;
  }

  private async ensureProductTypeExists(typeId: string) {
    const productType = await this.prisma.productType.findUnique({
      where: { id: typeId },
    });

    if (!productType) {
      throw new NotFoundException('Product type not found');
    }
  }

  private async ensureTagsExist(tagIds: string[]) {
    const uniqueTagIds = [...new Set(tagIds)];

    const tagsCount = await this.prisma.tag.count({
      where: {
        id: {
          in: uniqueTagIds,
        },
      },
    });

    if (tagsCount !== uniqueTagIds.length) {
      throw new NotFoundException('One or more tags were not found');
    }
  }
}
