import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { UseCasePort } from "@shared/application/ports/use-case.port"
import { INVENTORY_MOVEMENT_REPOSITORY_PORT, InventoryMovementRepositoryPort, InventoryMovementSelectors } from "../ports/inventory-movement-repository.port"
import { InventoryMovementStatus } from "@prisma/client"

@Injectable()
export class DeleteInventoryMovementUseCase implements UseCasePort<InventoryMovementSelectors, void> {
  constructor(
    @Inject(INVENTORY_MOVEMENT_REPOSITORY_PORT)
    private readonly inventoryMovementRepository: InventoryMovementRepositoryPort,
  ) {}

  async execute(input: InventoryMovementSelectors): Promise<void> {
    const movement = await this.inventoryMovementRepository.findByUnique(input)
    if (!movement) throw new NotFoundException("Movimento de stock não encontrado.")
    if (movement.getPrimitiveProps().status === InventoryMovementStatus.DELETED) {
      throw new ConflictException("O movimento já foi apagado.")
    }

    await this.inventoryMovementRepository.delete(input)
  }
}
