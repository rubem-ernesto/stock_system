import { InventoryMovementReason, InventoryMovementType } from "@prisma/client"
import { IdVO } from "@shared/domain/value-objects/id.vo"
import { InventoryMovement } from "src/inventory-movement/domain/entities/inventory-movement.entity"

export interface RecordInventoryMovementInput {
  workspaceId: IdVO
  userId: IdVO
  productId: IdVO
  type: InventoryMovementType
  reason?: InventoryMovementReason
  quantity?: number
  unitPrice?: number
  note?: string
}

export interface InventoryMovementSelectors {
  id?: string
  workspaceId: IdVO
}

export interface InventoryMovementRepositoryPort {
  record(input: RecordInventoryMovementInput): Promise<InventoryMovement>
  findByUnique(selectors: InventoryMovementSelectors): Promise<InventoryMovement | null>
  delete(selectors: InventoryMovementSelectors): Promise<void>
  findMany(workspaceId: IdVO, productId?: IdVO, type?: InventoryMovementType, reason?: InventoryMovementReason, lastId?: string, limit?: number): Promise<InventoryMovement[]>
}

export const INVENTORY_MOVEMENT_REPOSITORY_PORT = Symbol("INVENTORY_MOVEMENT_REPOSITORY_PORT")
