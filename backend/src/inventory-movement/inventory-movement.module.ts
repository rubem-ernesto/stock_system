import { Module } from "@nestjs/common"
import { PrismaModule } from "src/config/prisma/prisma.module"
import { INVENTORY_MOVEMENT_REPOSITORY_PORT } from "./application/ports/inventory-movement-repository.port"
import { CreateInventoryMovementUseCase } from "./application/use-cases/create-inventory-movement.use-case"
import { DeleteInventoryMovementUseCase } from "./application/use-cases/delete-inventory-movement.use-case"
import { GetInventoryMovementUseCase } from "./application/use-cases/get-inventory-movement.use-case"
import { GetInventoryMovementsUseCase } from "./application/use-cases/get-inventory-movements.use-case"
import { PrismaInventoryMovementRepositoryAdapter } from "./infrastructure/adapters/prisma-inventory-movement-repository.adapter"
import { InventoryMovementController } from "./presentation/controllers/inventory-movement.controller"

@Module({
  imports: [PrismaModule],
  controllers: [InventoryMovementController],
  providers: [
    CreateInventoryMovementUseCase,
    DeleteInventoryMovementUseCase,
    GetInventoryMovementUseCase,
    GetInventoryMovementsUseCase,
    {
      provide: INVENTORY_MOVEMENT_REPOSITORY_PORT,
      useClass: PrismaInventoryMovementRepositoryAdapter,
    },
  ],
  exports: [CreateInventoryMovementUseCase, DeleteInventoryMovementUseCase, GetInventoryMovementUseCase, GetInventoryMovementsUseCase],
})
export class InventoryMovementModule {}
