import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('products/:productId/images')
  @UseInterceptors(FileInterceptor('file'))
  uploadProductImage(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('altText') altText?: string,
    @Body('isMain') isMain?: string,
  ) {
    return this.uploadsService.uploadProductImage(
      productId,
      file,
      altText,
      isMain === 'true',
    );
  }

  @Delete('products/images/:imageId')
  deleteProductImage(@Param('imageId') imageId: string) {
    return this.uploadsService.deleteProductImage(imageId);
  }
}
