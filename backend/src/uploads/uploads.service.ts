import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadsService {
  private readonly supabase: SupabaseClient;
  private readonly bucketName: string;

  constructor(private readonly prisma: PrismaService) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET;

    if (!supabaseUrl || !supabaseServiceRoleKey || !bucketName) {
      throw new Error('Supabase storage environment variables are missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    this.bucketName = bucketName;
  }

  async uploadProductImage(
    productId: string,
    file: Express.Multer.File,
    altText?: string,
    isMain = false,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const fileExtension = this.getFileExtension(file.originalname);
    const fileName = `${Date.now()}-${randomUUID()}.${fileExtension}`;
    const storagePath = `products/${product.ref}/${fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from(this.bucketName)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new InternalServerErrorException(uploadError.message);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(storagePath);

    const currentImagesCount = await this.prisma.productImage.count({
      where: { productId },
    });

    const shouldBeMain = isMain || currentImagesCount === 0;

    if (shouldBeMain) {
      await this.prisma.productImage.updateMany({
        where: { productId },
        data: { isMain: false },
      });
    }

    const image = await this.prisma.productImage.create({
      data: {
        productId,
        url: publicUrlData.publicUrl,
        storagePath,
        altText,
        isMain: shouldBeMain,
        position: currentImagesCount,
      },
    });

    return image;
  }

  async setMainProductImage(imageId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Product image not found');
    }

    const updatedImage = await this.prisma.$transaction(async (tx) => {
      await tx.productImage.updateMany({
        where: { productId: image.productId },
        data: { isMain: false },
      });

      return tx.productImage.update({
        where: { id: imageId },
        data: { isMain: true },
      });
    });

    return updatedImage;
  }

  async deleteProductImage(imageId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Product image not found');
    }

    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([image.storagePath]);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    await this.prisma.productImage.delete({
      where: { id: imageId },
    });

    if (image.isMain) {
      const nextImage = await this.prisma.productImage.findFirst({
        where: { productId: image.productId },
        orderBy: { position: 'asc' },
      });

      if (nextImage) {
        await this.prisma.productImage.update({
          where: { id: nextImage.id },
          data: { isMain: true },
        });
      }
    }

    return { success: true };
  }

  private getFileExtension(originalName: string): string {
    const extension = originalName.split('.').pop();

    if (!extension) {
      throw new BadRequestException('Invalid file name');
    }

    return extension.toLowerCase();
  }
}
