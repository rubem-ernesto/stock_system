import { BadRequestException, Inject, Injectable } from "@nestjs/common"
import { InventoryMovementType } from "@prisma/client"
import { UseCasePort } from "@shared/application/ports/use-case.port"
import { INVENTORY_MOVEMENT_REPOSITORY_PORT, InventoryMovementRepositoryPort, RecordInventoryMovementInput } from "../ports/inventory-movement-repository.port"
import { InventoryMovement } from "src/inventory-movement/domain/entities/inventory-movement.entity"

@Injectable()
export class CreateInventoryMovementUseCase implements UseCasePort<RecordInventoryMovementInput, InventoryMovement> {
  constructor(
    @Inject(INVENTORY_MOVEMENT_REPOSITORY_PORT)
    private readonly inventoryMovementRepository: InventoryMovementRepositoryPort,
  ) {}

  async execute(input: RecordInventoryMovementInput): Promise<InventoryMovement> {
    const lifecycleMovement = input.type === InventoryMovementType.DELETE || input.type === InventoryMovementType.RESTORE
    const quantityRequired = input.type === InventoryMovementType.IN || input.type === InventoryMovementType.OUT || input.type === InventoryMovementType.ADJUST

    if (quantityRequired && input.quantity === undefined) {
      throw new BadRequestException("Informe a quantidade do movimento.")
    }
    if (lifecycleMovement && input.quantity !== undefined) {
      throw new BadRequestException("A quantidade de movimentos DELETE/RESTORE é obtida do stock atual.")
    }
    if (input.quantity !== undefined && input.quantity < 0) {
      throw new BadRequestException("A quantidade não pode ser negativa.")
    }
    if ((input.type === InventoryMovementType.IN || input.type === InventoryMovementType.OUT) && input.quantity === 0) {
      throw new BadRequestException("A quantidade de uma entrada ou saída deve ser maior que zero.")
    }
    if (input.unitPrice !== undefined && (!Number.isFinite(input.unitPrice) || input.unitPrice < 0)) {
      throw new BadRequestException("O preço unitário deve ser um número maior ou igual a zero.")
    }

    return this.inventoryMovementRepository.record(input)
  }
}
