import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductVariantInput } from './dto/create-product-variant.input';
import { UpdateProductVariantInput } from './dto/update-product-variant.input';
import { UpdateVariantPriceInput } from './dto/update-variant-price.input';

@Injectable()
export class VariantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateProductVariantInput) {
    await this.ensureProductExists(input.productId);

    const color = this.normalizeRequired(
      input.color,
      'Variant color is required',
    );
    const size = this.normalizeRequired(input.size, 'Variant size is required');

    if (input.price < 0) {
      throw new BadRequestException('Variant price cannot be negative');
    }

    const variant = await this.prisma.productVariant.create({
      data: {
        productId: input.productId,
        color,
        size,
        price: input.price,
      },
    });

    return this.mapVariant(variant);
  }

  async update(input: UpdateProductVariantInput) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: input.id },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    if (input.price !== undefined && input.price < 0) {
      throw new BadRequestException('Variant price cannot be negative');
    }

    const updatedVariant = await this.prisma.productVariant.update({
      where: { id: input.id },
      data: {
        color: input.color
          ? this.normalizeRequired(input.color, 'Variant color is required')
          : undefined,
        size: input.size
          ? this.normalizeRequired(input.size, 'Variant size is required')
          : undefined,
        price: input.price,
      },
    });

    return this.mapVariant(updatedVariant);
  }

  async updatePrice(input: UpdateVariantPriceInput) {
    if (input.newPrice < 0) {
      throw new BadRequestException('Variant price cannot be negative');
    }

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: input.variantId },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    if (input.changedByUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: input.changedByUserId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    const updatedVariant = await this.prisma.$transaction(async (tx) => {
      await tx.priceHistory.create({
        data: {
          variantId: input.variantId,
          oldPrice: variant.price,
          newPrice: input.newPrice,
          changedByUserId: input.changedByUserId,
        },
      });

      return tx.productVariant.update({
        where: { id: input.variantId },
        data: {
          price: input.newPrice,
        },
      });
    });

    return this.mapVariant(updatedVariant);
  }

  async remove(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    await this.prisma.productVariant.delete({
      where: { id },
    });

    return true;
  }

  private async ensureProductExists(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  private normalizeRequired(value: string, errorMessage: string) {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new BadRequestException(errorMessage);
    }

    return normalizedValue;
  }

  private mapVariant(variant: any) {
    return {
      ...variant,
      price: Number(variant.price),
    };
  }
}
