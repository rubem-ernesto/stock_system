import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from "@nestjs/swagger"
import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, MinLength } from "class-validator"
import { IReturnableProduct } from "src/product/domain/entities/product.entity"

export class CreateProductDto {
  @ApiProperty({ example: "5601234567890", description: "Código de barras único do produto." })
  @IsString()
  @MinLength(1)
  barcode!: string

  @ApiProperty({ example: "c2c44511-e3ab-43d5-a81f-4a03d63021a2", description: "UUID do workspace do produto." })
  @IsUUID()
  workspaceId!: string

  @ApiProperty({ example: "Café em grão", description: "Nome do produto." })
  @IsString()
  @MinLength(3)
  name!: string

  @ApiProperty({ example: 7.5, minimum: 0, description: "Preço de compra." })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  purchasedPrice!: number

  @ApiProperty({ example: 12.99, minimum: 0, description: "Preço de venda." })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number

  @ApiProperty({ example: 24, minimum: 0, description: "Quantidade atual em stock." })
  @IsInt()
  @Min(0)
  quantity!: number

  @ApiProperty({ example: 5, minimum: 0, description: "Quantidade mínima de stock." })
  @IsInt()
  @Min(0)
  minQuantity!: number

  @ApiPropertyOptional({ example: "un", description: "Unidade usada para contar o produto." })
  @IsOptional()
  @IsString()
  unit?: string
}

export class UpdateProductDto extends PartialType(OmitType(CreateProductDto, ["workspaceId"] as const)) {}

export class ProductResponseDto implements IReturnableProduct {
  @ApiProperty({ example: "8431f370-4687-4fad-9d41-5bd5dde566b6" })
  id!: string

  @ApiProperty({ example: "5601234567890" })
  barcode!: string

  @ApiProperty({ example: "Café em grão" })
  name!: string

  @ApiProperty({ example: 7.5 })
  purchasedPrice!: number

  @ApiProperty({ example: 12.99 })
  price!: number

  @ApiProperty({ example: 24 })
  quantity!: number

  @ApiProperty({ example: 5 })
  minQuantity!: number

  @ApiProperty({ example: "cafe-em-grao_a1b2c3d4e5" })
  slug!: string

  @ApiProperty({ example: "f846cf11-f55b-4be4-9062-bf9f7f213d29" })
  cadasterId!: string

  @ApiProperty({ example: "c2c44511-e3ab-43d5-a81f-4a03d63021a2" })
  workspaceId!: string

  @ApiProperty({ example: "ACTIVE", enum: ["ACTIVE", "DELETED", "PADDING", "SUSPENDED"] })
  status!: "ACTIVE" | "DELETED" | "PADDING" | "SUSPENDED"

  @ApiPropertyOptional({ example: "un", nullable: true })
  unit?: string | null

  @ApiPropertyOptional({ example: "2026-10-11T12:00:00.000Z", nullable: true })
  createdAt?: Date | null

  @ApiPropertyOptional({ example: "2026-10-11T12:00:00.000Z", nullable: true })
  updatedAt?: Date | null

  @ApiPropertyOptional({ example: null, nullable: true })
  deletedAt?: Date | null
}

export class ProductSuccessResponseDto {
  @ApiProperty({ type: ProductResponseDto })
  product!: ProductResponseDto

  @ApiProperty({ example: 200 })
  statusCode!: number

  @ApiProperty({ example: "Produto encontrado com sucesso." })
  message!: string
}

export class ProductCreatedSuccessResponseDto {
  @ApiProperty({ type: ProductResponseDto })
  product!: ProductResponseDto

  @ApiProperty({ example: 201 })
  statusCode!: number

  @ApiProperty({ example: "Produto cadastrado com sucesso." })
  message!: string
}

export class ProductsSuccessResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  products!: ProductResponseDto[]

  @ApiProperty({ example: 200 })
  statusCode!: number

  @ApiProperty({ example: "Busca de produtos realizada com sucesso." })
  message!: string
}

export class DeleteProductSuccessResponseDto {
  @ApiProperty({ example: true })
  isDeleted!: boolean

  @ApiProperty({ example: 200 })
  statusCode!: number

  @ApiProperty({ example: "Produto apagado com sucesso." })
  message!: string
}
