import { IdVO } from "@shared/domain/value-objects/id.vo"
import { Product } from "src/product/domain/entities/product.entity"

export interface ProductSelectors {
  id?: string
  slug?: string
  barcode?: string
}

export interface ProductRepositoryPort {
  create(product: Product): Promise<Product>
  findByUnique(selectors: ProductSelectors): Promise<Product | null>
  findByBarcode(barcode: string): Promise<Product | null>
  findMany(
    workspaceId: IdVO,
    lastId?: string,
    limit?: number,
    slugFilter?: string,
    nameFilter?: string,
    barcodeFilter?: string,
  ): Promise<Product[]>
  delete(id: IdVO): Promise<void>
  update(product: Product): Promise<Product>
}

export const PRODUCT_REPOSITORY_PORT = Symbol("PRODUCT_REPOSITORY_PORT")
