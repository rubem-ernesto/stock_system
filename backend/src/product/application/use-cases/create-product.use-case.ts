import { ConflictException, Inject, Injectable } from "@nestjs/common"
import { UseCasePort } from "@shared/application/ports/use-case.port"
import { IdVO } from "@shared/domain/value-objects/id.vo"
import { Product, ProductStatus } from "src/product/domain/entities/product.entity"
import { NameVO } from "src/product/domain/value-bojects/name.vo"
import { PRODUCT_REPOSITORY_PORT, ProductRepositoryPort } from "../ports/product-repository.port"

export interface CreateProductInput {
  barcode: string
  name: NameVO
  purchasedPrice: number
  price: number
  quantity: number
  minQuantity: number
  cadasterId: IdVO
  workspaceId: IdVO
  status?: ProductStatus
  unit?: string
}

@Injectable()
export class CreateProductUseCase implements UseCasePort<CreateProductInput, Product> {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const existingProduct = await this.productRepository.findByBarcode(input.barcode)
    if (existingProduct) throw new ConflictException("Já existe um produto com este código de barras.")

    const product = Product.createInstance({
      ...input,
      unit: input.unit ?? null,
    })

    return this.productRepository.create(product)
  }
}
