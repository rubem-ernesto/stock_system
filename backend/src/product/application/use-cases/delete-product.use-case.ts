import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { UseCasePort } from "@shared/application/ports/use-case.port"
import { IdVO } from "@shared/domain/value-objects/id.vo"
import { PRODUCT_REPOSITORY_PORT, ProductRepositoryPort } from "../ports/product-repository.port"

@Injectable()
export class DeleteProductUseCase implements UseCasePort<IdVO, void> {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(id: IdVO): Promise<void> {
    const product = await this.productRepository.findByUnique({ id: id.get() })
    if (!product) throw new NotFoundException("Produto não encontrado.")
    await this.productRepository.delete(id)
  }
}
