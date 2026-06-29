import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PriceHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const history = await this.prisma.priceHistory.findMany({
      orderBy: {
        changedAt: 'desc',
      },
    });

    return history.map((item) => this.mapPriceHistory(item));
  }

  async findByVariant(variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    const history = await this.prisma.priceHistory.findMany({
      where: {
        variantId,
      },
      orderBy: {
        changedAt: 'desc',
      },
    });

    return history.map((item) => this.mapPriceHistory(item));
  }

  private mapPriceHistory(item: any) {
    return {
      ...item,
      oldPrice: Number(item.oldPrice),
      newPrice: Number(item.newPrice),
    };
  }
}
