import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { UseCasePort } from "@shared/application/ports/use-case.port"
import { INVENTORY_MOVEMENT_REPOSITORY_PORT, InventoryMovementRepositoryPort, InventoryMovementSelectors } from "../ports/inventory-movement-repository.port"
import { InventoryMovement } from "src/inventory-movement/domain/entities/inventory-movement.entity"

@Injectable()
export class GetInventoryMovementUseCase implements UseCasePort<InventoryMovementSelectors, InventoryMovement> {
  constructor(
    @Inject(INVENTORY_MOVEMENT_REPOSITORY_PORT)
    private readonly inventoryMovementRepository: InventoryMovementRepositoryPort,
  ) {}

  async execute(input: InventoryMovementSelectors): Promise<InventoryMovement> {
    if (!input.id) throw new BadRequestException("Informe o identificador do movimento.")
    const movement = await this.inventoryMovementRepository.findByUnique(input)
    if (!movement) throw new NotFoundException("Movimento de stock não encontrado.")
    return movement
  }
}
