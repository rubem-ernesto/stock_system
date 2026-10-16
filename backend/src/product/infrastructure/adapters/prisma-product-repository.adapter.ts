import { Injectable } from "@nestjs/common"
import { Product as PrismaProduct } from "@prisma/client"
import { IdVO } from "@shared/domain/value-objects/id.vo"
import { SlugVO } from "@shared/domain/value-objects/slug.vo"
import { PrismaService } from "src/config/prisma/prisma.service"
import { ProductRepositoryPort, ProductSelectors } from "src/product/application/ports/product-repository.port"
import { IProduct, Product } from "src/product/domain/entities/product.entity"
import { NameVO } from "src/product/domain/value-bojects/name.vo"

@Injectable()
export class PrismaProductRepositoryAdapter implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(product: Product): Promise<Product> {
    const { createdAt, updatedAt, deletedAt, ...data } = product.getPrimitiveProps()
    const savedProduct = await this.prisma.product.create({
      data: {
        id: data.id,
        barcode: data.barcode,
        name: data.name,
        Purchasedprice: data.purchasedPrice,
        price: data.price,
        quantity: data.quantity,
        minQuantity: data.minQuantity,
        slug: data.slug,
        cadasterId: data.cadasterId,
        workspaceId: data.workspaceId,
        status: data.status,
        unit: data.unit,
      },
    })
    return this.restoreProduct(savedProduct)
  }

  async findByUnique(selectors: ProductSelectors): Promise<Product | null> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: selectors.id,
        slug: selectors.slug,
        barcode: selectors.barcode,
        status: "ACTIVE",
      },
    })
    return product ? this.restoreProduct(product) : null
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({ where: { barcode } })
    return product ? this.restoreProduct(product) : null
  }

  async findMany(workspaceId: IdVO, lastId?: string, limit?: number, slugFilter?: string, nameFilter?: string, barcodeFilter?: string): Promise<Product[]> {
    const whereConfig = {
      workspaceId: workspaceId.get(),
      status: "ACTIVE" as const,
      ...(slugFilter && { slug: { contains: slugFilter, mode: "insensitive" as const } }),
      ...(nameFilter && { name: { contains: nameFilter, mode: "insensitive" as const } }),
      ...(barcodeFilter && { barcode: { contains: barcodeFilter, mode: "insensitive" as const } }),
    }

    let validCursor: { id: string } | undefined
    if (lastId) {
      const cursorExists = await this.prisma.product.findFirst({
        where: { id: lastId, ...whereConfig },
        select: { id: true },
      })
      if (cursorExists) validCursor = { id: lastId }
    }

    const products = await this.prisma.product.findMany({
      where: whereConfig,
      take: limit || 15,
      ...(validCursor && { skip: 1, cursor: validCursor }),
      orderBy: { createdAt: "asc" },
    })
    return products.map((product) => this.restoreProduct(product))
  }

  async delete(id: IdVO): Promise<void> {
    await this.prisma.product.update({
      where: { id: id.get() },
      data: { deletedAt: new Date(), status: "DELETED" },
    })
  }

  async update(product: Product): Promise<Product> {
    const { id, createdAt, updatedAt, deletedAt, ...data } = product.getPrimitiveProps()
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        barcode: data.barcode,
        name: data.name,
        Purchasedprice: data.purchasedPrice,
        price: data.price,
        quantity: data.quantity,
        minQuantity: data.minQuantity,
        slug: data.slug,
        unit: data.unit,
      },
    })
    return this.restoreProduct(updatedProduct)
  }

  private restoreProduct(product: PrismaProduct): Product {
    const props: IProduct = {
      id: new IdVO(product.id),
      barcode: product.barcode,
      name: new NameVO(product.name),
      purchasedPrice: Number(product.Purchasedprice),
      price: Number(product.price),
      quantity: product.quantity,
      minQuantity: product.minQuantity,
      slug: SlugVO.restore(product.slug),
      cadasterId: new IdVO(product.cadasterId),
      workspaceId: new IdVO(product.workspaceId),
      status: product.status,
      unit: product.unit,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
    }
    return Product.restore(props)
  }
}
