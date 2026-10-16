import { InventoryMovementReason, InventoryMovementStatus, InventoryMovementType } from "@prisma/client"
import { IdVO } from "@shared/domain/value-objects/id.vo"

export interface IInventoryMovement {
  readonly id: IdVO
  readonly workspaceId: IdVO
  readonly userId: IdVO
  readonly productId: IdVO
  readonly type: InventoryMovementType
  readonly reason?: InventoryMovementReason | null
  readonly status: InventoryMovementStatus
  readonly quantity: number
  readonly unitPrice: number | null
  readonly totalPrice: number | null
  readonly note?: string | null
  readonly createdAt?: Date | null
  readonly updatedAt?: Date | null
  readonly deletedAt?: Date | null
}

export interface IPrimitiveInventoryMovement {
  readonly id: string
  readonly workspaceId: string
  readonly userId: string
  readonly productId: string
  readonly type: InventoryMovementType
  readonly reason?: InventoryMovementReason | null
  readonly status: InventoryMovementStatus
  readonly quantity: number
  readonly unitPrice: number | null
  readonly totalPrice: number | null
  readonly note?: string | null
  readonly createdAt?: Date | null
  readonly updatedAt?: Date | null
  readonly deletedAt?: Date | null
}

export interface CreateInventoryMovementEntityInput {
  workspaceId: IdVO
  userId: IdVO
  productId: IdVO
  type: InventoryMovementType
  reason?: InventoryMovementReason
  quantity: number
  unitPrice: number
  note?: string
}

export class InventoryMovement {
  private constructor(private readonly props: IInventoryMovement) {
    Object.freeze(this)
  }

  static createInstance(input: CreateInventoryMovementEntityInput): InventoryMovement {
    const roundedUnitPrice = Number(input.unitPrice.toFixed(2))
    return new InventoryMovement({
      ...input,
      id: new IdVO(),
      status: InventoryMovementStatus.ACTIVE,
      unitPrice: roundedUnitPrice,
      totalPrice: Number((input.quantity * roundedUnitPrice).toFixed(2)),
    })
  }

  static restore(props: IInventoryMovement): InventoryMovement {
    return new InventoryMovement(props)
  }

  getProps(): IInventoryMovement {
    return this.props
  }

  getPrimitiveProps(): IPrimitiveInventoryMovement {
    return {
      id: this.props.id.get(),
      workspaceId: this.props.workspaceId.get(),
      userId: this.props.userId.get(),
      productId: this.props.productId.get(),
      type: this.props.type,
      reason: this.props.reason,
      status: this.props.status,
      quantity: this.props.quantity,
      unitPrice: this.props.unitPrice,
      totalPrice: this.props.totalPrice,
      note: this.props.note,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      deletedAt: this.props.deletedAt,
    }
  }
}
