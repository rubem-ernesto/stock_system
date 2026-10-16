import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { UseCasePort } from "@shared/application/ports/use-case.port"
import { IdVO } from "@shared/domain/value-objects/id.vo"
import { Product, UpdateProductInput } from "src/product/domain/entities/product.entity"
import { PRODUCT_REPOSITORY_PORT, ProductRepositoryPort } from "../ports/product-repository.port"

export interface UpdateProductUseCaseInput {
  productId: IdVO
  data: UpdateProductInput
}

@Injectable()
export class UpdateProductUseCase implements UseCasePort<UpdateProductUseCaseInput, Product> {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(input: UpdateProductUseCaseInput): Promise<Product> {
    if (Object.keys(input.data).length === 0) {
      throw new BadRequestException("Informe pelo menos um campo para atualizar.")
    }

    const product = await this.productRepository.findByUnique({ id: input.productId.get() })
    if (!product) throw new NotFoundException("Produto não encontrado.")

    if (input.data.barcode && input.data.barcode !== product.getPrimitiveProps().barcode) {
      const existingProduct = await this.productRepository.findByBarcode(input.data.barcode)
      if (existingProduct) throw new ConflictException("Já existe um produto com este código de barras.")
    }

    product.setProps(input.data)
    return this.productRepository.update(product)
  }
}
