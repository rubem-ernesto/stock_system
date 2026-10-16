import { Module } from "@nestjs/common"
import { PrismaModule } from "src/config/prisma/prisma.module"
import { PRODUCT_REPOSITORY_PORT } from "./application/ports/product-repository.port"
import { CreateProductUseCase } from "./application/use-cases/create-product.use-case"
import { DeleteProductUseCase } from "./application/use-cases/delete-product.use-case"
import { GetProductUseCase } from "./application/use-cases/get-product.use-case"
import { GetProductsUseCase } from "./application/use-cases/get-products.use-case"
import { UpdateProductUseCase } from "./application/use-cases/update-product.use-case"
import { PrismaProductRepositoryAdapter } from "./infrastructure/adapters/prisma-product-repository.adapter"
import { ProductController } from "./presentation/controllers/product.controller"

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetProductUseCase,
    GetProductsUseCase,
    { provide: PRODUCT_REPOSITORY_PORT, useClass: PrismaProductRepositoryAdapter },
  ],
  exports: [
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetProductUseCase,
    GetProductsUseCase,
  ],
})
export class ProductModule {}
