import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common"
import { InventoryMovement as PrismaInventoryMovement, InventoryMovementReason, InventoryMovementStatus, InventoryMovementType, ProductStatus } from "@prisma/client"
import { IdVO } from "@shared/domain/value-objects/id.vo"
import { PrismaService } from "src/config/prisma/prisma.service"
import { InventoryMovementRepositoryPort, InventoryMovementSelectors, RecordInventoryMovementInput } from "src/inventory-movement/application/ports/inventory-movement-repository.port"
import { IInventoryMovement, InventoryMovement } from "src/inventory-movement/domain/entities/inventory-movement.entity"

@Injectable()
export class PrismaInventoryMovementRepositoryAdapter implements InventoryMovementRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordInventoryMovementInput): Promise<InventoryMovement> {
    return this.prisma.$transaction(async (transaction) => {
      const product = await transaction.product.findFirst({
        where: {
          id: input.productId.get(),
          workspaceId: input.workspaceId.get(),
        },
      })
      if (!product) throw new NotFoundException("Produto não encontrado neste workspace.")

      const isDelete = input.type === InventoryMovementType.DELETE
      const isRestore = input.type === InventoryMovementType.RESTORE
      if (isDelete && product.status !== ProductStatus.ACTIVE) {
        throw new ConflictException("Só é possível apagar um produto ativo.")
      }
      if (isRestore && product.status !== ProductStatus.DELETED) {
        throw new ConflictException("Só é possível restaurar um produto apagado.")
      }
      if (!isDelete && !isRestore && product.status !== ProductStatus.ACTIVE) {
        throw new ConflictException("Não é possível movimentar um produto que não está ativo.")
      }

      const movementQuantity = isDelete || isRestore ? product.quantity : input.quantity
      if (movementQuantity === undefined) {
        throw new BadRequestException("Informe a quantidade do movimento.")
      }
      if (input.type === InventoryMovementType.OUT && product.quantity < movementQuantity) {
        throw new BadRequestException("Stock insuficiente para esta saída.")
      }

      const defaultUnitPrice = input.type === InventoryMovementType.IN ? Number(product.Purchasedprice) : Number(product.price)
      const movement = InventoryMovement.createInstance({
        workspaceId: input.workspaceId,
        userId: input.userId,
        productId: input.productId,
        type: input.type,
        reason: input.reason,
        quantity: movementQuantity,
        unitPrice: input.unitPrice ?? defaultUnitPrice,
        note: input.note,
      })
      const movementProps = movement.getPrimitiveProps()

      switch (input.type) {
        case InventoryMovementType.IN:
          {
            const result = await transaction.product.updateMany({
              where: {
                id: product.id,
                workspaceId: input.workspaceId.get(),
                status: ProductStatus.ACTIVE,
              },
              data: { quantity: { increment: movementQuantity } },
            })
            if (result.count === 0) throw new ConflictException("O produto deixou de estar ativo.")
          }
          break
        case InventoryMovementType.OUT: {
          const result = await transaction.product.updateMany({
            where: {
              id: product.id,
              workspaceId: input.workspaceId.get(),
              status: ProductStatus.ACTIVE,
              quantity: { gte: movementQuantity },
            },
            data: { quantity: { decrement: movementQuantity } },
          })
          if (result.count === 0) throw new BadRequestException("Stock insuficiente para esta saída.")
          break
        }
        case InventoryMovementType.ADJUST:
          {
            const result = await transaction.product.updateMany({
              where: {
                id: product.id,
                workspaceId: input.workspaceId.get(),
                status: ProductStatus.ACTIVE,
              },
              data: { quantity: movementQuantity },
            })
            if (result.count === 0) throw new ConflictException("O produto deixou de estar ativo.")
          }
          break
        case InventoryMovementType.DELETE: {
          const result = await transaction.product.updateMany({
            where: { id: product.id, workspaceId: input.workspaceId.get(), status: ProductStatus.ACTIVE },
            data: { status: ProductStatus.DELETED, deletedAt: new Date() },
          })
          if (result.count === 0) throw new ConflictException("Só é possível apagar um produto ativo.")
          break
        }
        case InventoryMovementType.RESTORE: {
          const result = await transaction.product.updateMany({
            where: { id: product.id, workspaceId: input.workspaceId.get(), status: ProductStatus.DELETED },
            data: { status: ProductStatus.ACTIVE, deletedAt: null },
          })
          if (result.count === 0) throw new ConflictException("Só é possível restaurar um produto apagado.")
          break
        }
      }

      const savedMovement = await transaction.inventoryMovement.create({
        data: {
          id: movementProps.id,
          workspaceId: movementProps.workspaceId,
          userId: movementProps.userId,
          productId: movementProps.productId,
          type: movementProps.type,
          reason: movementProps.reason,
          status: movementProps.status,
          quantity: movementProps.quantity,
          unitPrice: movementProps.unitPrice ?? undefined,
          totalPrice: movementProps.totalPrice ?? undefined,
          note: movementProps.note,
        },
      })
      return this.restoreMovement(savedMovement)
    })
  }

  async findByUnique(selectors: InventoryMovementSelectors): Promise<InventoryMovement | null> {
    const movement = await this.prisma.inventoryMovement.findFirst({
      where: { id: selectors.id, workspaceId: selectors.workspaceId.get() },
    })
    return movement ? this.restoreMovement(movement) : null
  }

  async delete(selectors: InventoryMovementSelectors): Promise<void> {
    const result = await this.prisma.inventoryMovement.updateMany({
      where: {
        id: selectors.id,
        workspaceId: selectors.workspaceId.get(),
        status: InventoryMovementStatus.ACTIVE,
      },
      data: {
        status: InventoryMovementStatus.DELETED,
        deletedAt: new Date(),
      },
    })
    if (result.count === 0) {
      throw new ConflictException("O movimento já foi apagado.")
    }
  }

  async findMany(workspaceId: IdVO, productId?: IdVO, type?: InventoryMovementType, reason?: InventoryMovementReason, lastId?: string, limit?: number): Promise<InventoryMovement[]> {
    const where = {
      workspaceId: workspaceId.get(),
      status: InventoryMovementStatus.ACTIVE,
      ...(productId && { productId: productId.get() }),
      ...(type && { type }),
      ...(reason && { reason }),
    }

    let cursor: { id: string } | undefined
    if (lastId) {
      const cursorExists = await this.prisma.inventoryMovement.findFirst({
        where: { id: lastId, ...where },
        select: { id: true },
      })
      if (cursorExists) cursor = { id: lastId }
    }

    const movements = await this.prisma.inventoryMovement.findMany({
      where,
      take: limit || 15,
      ...(cursor && { skip: 1, cursor }),
      orderBy: { createdAt: "asc" },
    })
    return movements.map((movement) => this.restoreMovement(movement))
  }

  private restoreMovement(movement: PrismaInventoryMovement): InventoryMovement {
    const props: IInventoryMovement = {
      id: new IdVO(movement.id),
      workspaceId: new IdVO(movement.workspaceId),
      userId: new IdVO(movement.userId),
      productId: new IdVO(movement.productId),
      type: movement.type,
      reason: movement.reason,
      status: movement.status,
      quantity: movement.quantity,
      unitPrice: movement.unitPrice === null ? null : Number(movement.unitPrice),
      totalPrice: movement.totalPrice === null ? null : Number(movement.totalPrice),
      note: movement.note,
      createdAt: movement.createdAt,
      updatedAt: movement.updatedAt,
      deletedAt: movement.deletedAt,
    }
    return InventoryMovement.restore(props)
  }
}
