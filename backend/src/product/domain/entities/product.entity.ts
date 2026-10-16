import { IdVO } from "@shared/domain/value-objects/id.vo"
import { SlugVO } from "@shared/domain/value-objects/slug.vo"
import { NameVO } from "../value-bojects/name.vo"

export type ProductStatus = "ACTIVE" | "DELETED" | "PADDING" | "SUSPENDED"

export interface IProduct {
  readonly id: IdVO
  barcode: string
  name: NameVO
  purchasedPrice: number
  price: number
  quantity: number
  minQuantity: number
  slug: SlugVO
  cadasterId: IdVO
  workspaceId: IdVO
  status: ProductStatus
  unit?: string | null
  createdAt?: Date | null
  updatedAt?: Date | null
  deletedAt?: Date | null
}

export interface IPrimitiveProduct {
  readonly id: string
  barcode: string
  name: string
  purchasedPrice: number
  price: number
  quantity: number
  minQuantity: number
  slug: string
  cadasterId: string
  workspaceId: string
  status: ProductStatus
  unit?: string | null
  createdAt?: Date | null
  updatedAt?: Date | null
  deletedAt?: Date | null
}

export type IReturnableProduct = IPrimitiveProduct

export type UpdateProductInput = Partial<{
  name: string
  purchasedPrice: number
  price: number
  quantity: number
  minQuantity: number
  barcode: string
  unit: string | null
}>

export type UpdateProductuInput = UpdateProductInput

export class Product {
  private readonly props: IProduct

  private constructor(productProps: IProduct) {
    this.props = productProps
    Object.freeze(this)
  }

  static createInstance(input: Omit<IProduct, "id" | "slug" | "status"> & { status?: ProductStatus }): Product {
    return new Product({
      ...input,
      id: new IdVO(),
      slug: SlugVO.createFromText(input.name.get()),
      status: input.status ?? "ACTIVE",
    })
  }

  static restore(productProps: IProduct): Product {
    return new Product(productProps)
  }

  public getProps(): IProduct {
    return this.props
  }

  public getPrimitiveProps(): IPrimitiveProduct {
    return {
      id: this.props.id.get(),
      barcode: this.props.barcode,
      name: this.props.name.get(),
      purchasedPrice: this.props.purchasedPrice,
      price: this.props.price,
      quantity: this.props.quantity,
      minQuantity: this.props.minQuantity,
      slug: this.props.slug.get(),
      cadasterId: this.props.cadasterId.get(),
      workspaceId: this.props.workspaceId.get(),
      status: this.props.status,
      unit: this.props.unit,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      deletedAt: this.props.deletedAt,
    }
  }

  public getReturnableProps(): IReturnableProduct {
    return this.getPrimitiveProps()
  }

  public addQuantity(quantity: number): void {
    this.props.quantity += quantity
  }

  public decreaseQuantity(quantity: number): void {
    this.props.quantity -= quantity
  }

  public setProps(updatePropsInput: UpdateProductInput): void {
    if (updatePropsInput.name !== undefined) {
      this.props.name = new NameVO(updatePropsInput.name)
      this.props.slug = SlugVO.createFromText(updatePropsInput.name)
    }
    if (updatePropsInput.purchasedPrice !== undefined) this.props.purchasedPrice = updatePropsInput.purchasedPrice
    if (updatePropsInput.price !== undefined) this.props.price = updatePropsInput.price
    if (updatePropsInput.quantity !== undefined) this.props.quantity = updatePropsInput.quantity
    if (updatePropsInput.minQuantity !== undefined) this.props.minQuantity = updatePropsInput.minQuantity
    if (updatePropsInput.barcode !== undefined) this.props.barcode = updatePropsInput.barcode
    if (updatePropsInput.unit !== undefined) this.props.unit = updatePropsInput.unit
  }
}
