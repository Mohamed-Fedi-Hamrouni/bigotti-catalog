import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ProductTypeModel } from '../product-types/product-type.model';
import { TagModel } from '../tags/tag.model';
import { ProductVariantModel } from '../variants/product-variant.model';

@ObjectType()
export class ProductImageModel {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  productId: string;

  @Field()
  url: string;

  @Field()
  storagePath: string;

  @Field({ nullable: true })
  altText?: string;

  @Field()
  isMain: boolean;

  @Field()
  position: number;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class ProductModel {
  @Field(() => ID)
  id: string;

  @Field()
  ref: string;

  @Field()
  name: string;

  @Field(() => ID)
  typeId: string;

  @Field(() => ProductTypeModel)
  type: ProductTypeModel;

  @Field(() => [ProductVariantModel])
  variants: ProductVariantModel[];

  @Field(() => [TagModel])
  tags: TagModel[];

  @Field(() => [ProductImageModel])
  images: ProductImageModel[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
