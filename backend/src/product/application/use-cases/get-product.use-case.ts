import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { UseCasePort } from "@shared/application/ports/use-case.port"
import { Product } from "src/product/domain/entities/product.entity"
import { PRODUCT_REPOSITORY_PORT, ProductRepositoryPort, ProductSelectors } from "../ports/product-repository.port"

@Injectable()
export class GetProductUseCase implements UseCasePort<ProductSelectors, Product> {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(input: ProductSelectors): Promise<Product> {
    if (!input.id && !input.slug && !input.barcode) {
      throw new BadRequestException("Informe o identificador, slug ou código de barras do produto.")
    }

    const product = await this.productRepository.findByUnique(input)
    if (!product) throw new NotFoundException("Produto não encontrado.")
    return product
  }
}
