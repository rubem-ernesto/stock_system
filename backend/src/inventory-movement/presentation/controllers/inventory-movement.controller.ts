import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseEnumPipe, ParseUUIDPipe, Post, Query, Req, UseGuards } from "@nestjs/common"
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger"
import { InventoryMovementReason, InventoryMovementType } from "@prisma/client"
import { Request } from "express"
import { IdVO } from "@shared/domain/value-objects/id.vo"
import { AuthGuard } from "src/auth/presentation/guards/auth.guard"
import { BadRequestResponseDto, ServerErrorResponseDto } from "src/user/presentation/dtos/comoms-responses.dtos"
import { CreateInventoryMovementUseCase } from "src/inventory-movement/application/use-cases/create-inventory-movement.use-case"
import { DeleteInventoryMovementUseCase } from "src/inventory-movement/application/use-cases/delete-inventory-movement.use-case"
import { GetInventoryMovementUseCase } from "src/inventory-movement/application/use-cases/get-inventory-movement.use-case"
import { GetInventoryMovementsUseCase } from "src/inventory-movement/application/use-cases/get-inventory-movements.use-case"
import { CreateInventoryMovementDto } from "../dtos/inventory-movement.dtos"
import {
  DeleteInventoryMovementSuccessResponseDto,
  InventoryMovementCreatedResponseDto,
  InventoryMovementSuccessResponseDto,
  InventoryMovementsSuccessResponseDto,
} from "../dtos/inventory-movement.dtos"

interface AuthenticatedRequest extends Request {
  user: { userId: IdVO }
}

@Controller("inventory-movement")
@ApiTags("Movimentos de stock / Faturas")
@ApiResponse({ status: 500, description: "Erro no servidor", type: ServerErrorResponseDto })
@ApiBadRequestResponse({ description: "Dados do movimento inválidos.", type: BadRequestResponseDto })
@UseGuards(AuthGuard)
export class InventoryMovementController {
  constructor(
    private readonly movementCreator: CreateInventoryMovementUseCase,
    private readonly movementDeleter: DeleteInventoryMovementUseCase,
    private readonly movementGetter: GetInventoryMovementUseCase,
    private readonly movementsGetter: GetInventoryMovementsUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: "Registar movimento de stock e respetivo snapshot de fatura.",
    description: "IN aumenta o stock; OUT diminui sem permitir stock negativo; ADJUST define o stock final. " + "DELETE e RESTORE alteram o estado do produto e registam o stock atual.",
  })
  @ApiCreatedResponse({ description: "Fatura/movimento registado com sucesso.", type: InventoryMovementCreatedResponseDto })
  @ApiNotFoundResponse({ description: "Produto não encontrado neste workspace." })
  async create(@Body() dto: CreateInventoryMovementDto, @Req() request: AuthenticatedRequest) {
    const movement = await this.movementCreator.execute({
      workspaceId: new IdVO(dto.workspaceId),
      productId: new IdVO(dto.productId),
      userId: request.user.userId,
      type: dto.type,
      reason: dto.reason,
      quantity: dto.quantity,
      unitPrice: dto.unitPrice,
      note: dto.note,
    })

    return {
      movement: movement.getPrimitiveProps(),
      statusCode: HttpStatus.CREATED,
      message: "Fatura/movimento registado com sucesso.",
    }
  }

  @Get("get")
  @ApiOperation({ summary: "Consultar um movimento/fatura pelo identificador." })
  @ApiQuery({ name: "id", required: true, example: "9431f370-4687-4fad-9d41-5bd5dde566b6" })
  @ApiQuery({ name: "workspace_id", required: true, example: "c2c44511-e3ab-43d5-a81f-4a03d63021a2" })
  @ApiOkResponse({ description: "Movimento encontrado com sucesso.", type: InventoryMovementSuccessResponseDto })
  @ApiNotFoundResponse({ description: "Movimento não encontrado." })
  async get(@Query("id", new ParseUUIDPipe()) id: string, @Query("workspace_id", new ParseUUIDPipe()) workspaceId: string) {
    const movement = await this.movementGetter.execute({
      id,
      workspaceId: new IdVO(workspaceId),
    })
    return {
      movement: movement.getPrimitiveProps(),
      statusCode: HttpStatus.OK,
      message: "Movimento de stock encontrado com sucesso.",
    }
  }

  @Get("get-many")
  @ApiOperation({ summary: "Listar movimentos/faturas de um workspace com filtros e paginação." })
  @ApiQuery({ name: "workspace_id", required: true, example: "c2c44511-e3ab-43d5-a81f-4a03d63021a2" })
  @ApiQuery({ name: "product_id", required: false, example: "8431f370-4687-4fad-9d41-5bd5dde566b6" })
  @ApiQuery({ name: "type", required: false, enum: InventoryMovementType })
  @ApiQuery({ name: "reason", required: false, enum: InventoryMovementReason })
  @ApiQuery({ name: "last_id", required: false, example: "9431f370-4687-4fad-9d41-5bd5dde566b6" })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 15 })
  @ApiOkResponse({ description: "Movimentos listados com sucesso.", type: InventoryMovementsSuccessResponseDto })
  async getMany(
    @Query("workspace_id", new ParseUUIDPipe()) workspaceId: string,
    @Query("product_id", new ParseUUIDPipe({ optional: true })) productId?: string,
    @Query("type", new ParseEnumPipe(InventoryMovementType, { optional: true })) type?: InventoryMovementType,
    @Query("reason", new ParseEnumPipe(InventoryMovementReason, { optional: true })) reason?: InventoryMovementReason,
    @Query("last_id") lastId?: string,
    @Query("limit") limit?: number,
  ) {
    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
      throw new BadRequestException("O limite deve ser um número inteiro positivo.")
    }

    const movements = await this.movementsGetter.execute({
      workspaceId: new IdVO(workspaceId),
      productId: productId ? new IdVO(productId) : undefined,
      type,
      reason,
      lastId,
      limit,
    })
    return {
      movements: movements.map((movement) => movement.getPrimitiveProps()),
      statusCode: HttpStatus.OK,
      message: movements.length === 0 ? "Movimentos não encontrados." : "Movimentos listados com sucesso.",
    }
  }

  @Delete("delete/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Apagar logicamente um movimento de stock.",
    description: "Marca o movimento como DELETED sem alterar o stock; registe um movimento compensatório para corrigir o stock.",
  })
  @ApiParam({ name: "id", description: "UUID do movimento.", example: "9431f370-4687-4fad-9d41-5bd5dde566b6" })
  @ApiQuery({ name: "workspace_id", required: true, example: "c2c44511-e3ab-43d5-a81f-4a03d63021a2" })
  @ApiOkResponse({ description: "Movimento apagado com sucesso.", type: DeleteInventoryMovementSuccessResponseDto })
  @ApiNotFoundResponse({ description: "Movimento não encontrado neste workspace." })
  @ApiConflictResponse({ description: "O movimento já foi apagado." })
  async delete(@Param("id", new ParseUUIDPipe()) id: string, @Query("workspace_id", new ParseUUIDPipe()) workspaceId: string) {
    await this.movementDeleter.execute({
      id,
      workspaceId: new IdVO(workspaceId),
    })
    return {
      isDeleted: true,
      statusCode: HttpStatus.OK,
      message: "Movimento apagado com sucesso.",
    }
  }
}
