import { Inject, Injectable } from "@nestjs/common"
import { UseCasePort } from "@shared/application/ports/use-case.port"
import { IdVO } from "@shared/domain/value-objects/id.vo"
import { Product } from "src/product/domain/entities/product.entity"
import { PRODUCT_REPOSITORY_PORT, ProductRepositoryPort } from "../ports/product-repository.port"

export interface GetProductsInput {
  workspaceId: IdVO
  lastId?: string
  limit?: number
  slugFilter?: string
  nameFilter?: string
  barcodeFilter?: string
}

@Injectable()
export class GetProductsUseCase implements UseCasePort<GetProductsInput, Product[]> {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(input: GetProductsInput): Promise<Product[]> {
    return this.productRepository.findMany(
      input.workspaceId,
      input.lastId,
      input.limit,
      input.slugFilter,
      input.nameFilter,
      input.barcodeFilter,
    )
  }
}
