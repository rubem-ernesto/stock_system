import { Inject, Injectable } from "@nestjs/common"
import { InventoryMovementReason, InventoryMovementType } from "@prisma/client"
import { UseCasePort } from "@shared/application/ports/use-case.port"
import { IdVO } from "@shared/domain/value-objects/id.vo"
import { InventoryMovement } from "src/inventory-movement/domain/entities/inventory-movement.entity"
import { INVENTORY_MOVEMENT_REPOSITORY_PORT, InventoryMovementRepositoryPort } from "../ports/inventory-movement-repository.port"

export interface GetInventoryMovementsInput {
  workspaceId: IdVO
  productId?: IdVO
  type?: InventoryMovementType
  reason?: InventoryMovementReason
  lastId?: string
  limit?: number
}

@Injectable()
export class GetInventoryMovementsUseCase implements UseCasePort<GetInventoryMovementsInput, InventoryMovement[]> {
  constructor(
    @Inject(INVENTORY_MOVEMENT_REPOSITORY_PORT)
    private readonly inventoryMovementRepository: InventoryMovementRepositoryPort,
  ) {}

  async execute(input: GetInventoryMovementsInput): Promise<InventoryMovement[]> {
    return this.inventoryMovementRepository.findMany(input.workspaceId, input.productId, input.type, input.reason, input.lastId, input.limit)
  }
}
