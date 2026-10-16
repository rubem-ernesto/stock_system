import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { InventoryMovementReason, InventoryMovementStatus, InventoryMovementType } from "@prisma/client"
import { Type } from "class-transformer"
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateIf } from "class-validator"
import { IPrimitiveInventoryMovement } from "src/inventory-movement/domain/entities/inventory-movement.entity"

export class CreateInventoryMovementDto {
  @ApiProperty({ example: "c2c44511-e3ab-43d5-a81f-4a03d63021a2" })
  @IsUUID()
  workspaceId!: string

  @ApiProperty({ example: "8431f370-4687-4fad-9d41-5bd5dde566b6" })
  @IsUUID()
  productId!: string

  @ApiProperty({ enum: InventoryMovementType, example: InventoryMovementType.IN })
  @IsEnum(InventoryMovementType)
  type!: InventoryMovementType

  @ApiPropertyOptional({ enum: InventoryMovementReason, example: InventoryMovementReason.COMPRA })
  @IsOptional()
  @IsEnum(InventoryMovementReason)
  reason?: InventoryMovementReason

  @ApiPropertyOptional({
    example: 12,
    minimum: 0,
    description: "Quantidade movimentada; em ADJUST representa o stock final. DELETE/RESTORE usam o stock atual.",
  })
  @ValidateIf((input: CreateInventoryMovementDto) => input.type !== InventoryMovementType.DELETE && input.type !== InventoryMovementType.RESTORE)
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity?: number

  @ApiPropertyOptional({
    example: 10.5,
    minimum: 0,
    description: "Preço unitário da fatura. Por omissão usa o preço de compra em IN e o preço do produto nos outros tipos.",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice?: number

  @ApiPropertyOptional({ example: "Fatura de compra #2026-001" })
  @IsOptional()
  @IsString()
  note?: string
}

export class InventoryMovementResponseDto implements IPrimitiveInventoryMovement {
  @ApiProperty({ example: "9431f370-4687-4fad-9d41-5bd5dde566b6" })
  id!: string

  @ApiProperty({ example: "c2c44511-e3ab-43d5-a81f-4a03d63021a2" })
  workspaceId!: string

  @ApiProperty({ example: "f846cf11-f55b-4be4-9062-bf9f7f213d29" })
  userId!: string

  @ApiProperty({ example: "8431f370-4687-4fad-9d41-5bd5dde566b6" })
  productId!: string

  @ApiProperty({ enum: InventoryMovementType, example: InventoryMovementType.IN })
  type!: InventoryMovementType

  @ApiProperty({ enum: InventoryMovementStatus, example: InventoryMovementStatus.ACTIVE })
  status!: InventoryMovementStatus

  @ApiPropertyOptional({ enum: InventoryMovementReason, example: InventoryMovementReason.COMPRA, nullable: true })
  reason?: InventoryMovementReason | null

  @ApiProperty({ example: 12 })
  quantity!: number

  @ApiPropertyOptional({ example: 10.5, nullable: true })
  unitPrice!: number | null

  @ApiPropertyOptional({ example: 126, nullable: true })
  totalPrice!: number | null

  @ApiPropertyOptional({ example: "Fatura de compra #2026-001", nullable: true })
  note?: string | null

  @ApiPropertyOptional({ example: "2026-10-12T12:00:00.000Z", nullable: true })
  createdAt?: Date | null

  @ApiPropertyOptional({ example: "2026-10-12T12:00:00.000Z", nullable: true })
  updatedAt?: Date | null

  @ApiPropertyOptional({ example: null, nullable: true })
  deletedAt?: Date | null
}

export class InventoryMovementSuccessResponseDto {
  @ApiProperty({ type: InventoryMovementResponseDto })
  movement!: InventoryMovementResponseDto

  @ApiProperty({ example: 200 })
  statusCode!: number

  @ApiProperty({ example: "Movimento de stock encontrado com sucesso." })
  message!: string
}

export class InventoryMovementCreatedResponseDto {
  @ApiProperty({ type: InventoryMovementResponseDto })
  movement!: InventoryMovementResponseDto

  @ApiProperty({ example: 201 })
  statusCode!: number

  @ApiProperty({ example: "Fatura/movimento registado com sucesso." })
  message!: string
}

export class InventoryMovementsSuccessResponseDto {
  @ApiProperty({ type: [InventoryMovementResponseDto] })
  movements!: InventoryMovementResponseDto[]

  @ApiProperty({ example: 200 })
  statusCode!: number

  @ApiProperty({ example: "Movimentos listados com sucesso." })
  message!: string
}

export class DeleteInventoryMovementSuccessResponseDto {
  @ApiProperty({ example: true })
  isDeleted!: boolean

  @ApiProperty({ example: 200 })
  statusCode!: number

  @ApiProperty({ example: "Movimento apagado com sucesso." })
  message!: string
}
