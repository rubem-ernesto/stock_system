import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, Req, UseGuards } from "@nestjs/common"
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger"
import { Request } from "express"
import { AuthGuard } from "src/auth/presentation/guards/auth.guard"
import { IdVO } from "@shared/domain/value-objects/id.vo"
import { BadRequestResponseDto, ServerErrorResponseDto } from "src/user/presentation/dtos/comoms-responses.dtos"
import { CreateProductUseCase } from "src/product/application/use-cases/create-product.use-case"
import { DeleteProductUseCase } from "src/product/application/use-cases/delete-product.use-case"
import { GetProductUseCase } from "src/product/application/use-cases/get-product.use-case"
import { GetProductsUseCase } from "src/product/application/use-cases/get-products.use-case"
import { UpdateProductUseCase } from "src/product/application/use-cases/update-product.use-case"
import { NameVO } from "src/product/domain/value-bojects/name.vo"
import { CreateProductDto, DeleteProductSuccessResponseDto, ProductCreatedSuccessResponseDto, ProductSuccessResponseDto, ProductsSuccessResponseDto, UpdateProductDto } from "../dtos/product.dtos"

interface AuthenticatedRequest extends Request {
  user: { userId: IdVO }
}

@Controller("product")
@ApiTags("Produto")
@ApiResponse({ status: 500, description: "Erro no servidor", type: ServerErrorResponseDto })
@ApiBadRequestResponse({ description: "Erro de validação dos dados enviados", type: BadRequestResponseDto })
export class ProductController {
  constructor(
    private readonly productCreator: CreateProductUseCase,
    private readonly productUpdater: UpdateProductUseCase,
    private readonly productDeleter: DeleteProductUseCase,
    private readonly productGetter: GetProductUseCase,
    private readonly productsGetter: GetProductsUseCase,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Cadastrar produto." })
  @ApiCreatedResponse({ description: "Produto cadastrado com sucesso.", type: ProductCreatedSuccessResponseDto })
  @ApiConflictResponse({ description: "Já existe um produto com este código de barras." })
  async create(@Body() dto: CreateProductDto, @Req() request: AuthenticatedRequest) {
    const { workspaceId, ...productData } = dto
    const product = await this.productCreator.execute({
      ...productData,
      name: new NameVO(dto.name),
      cadasterId: request.user.userId,
      workspaceId: new IdVO(workspaceId),
    })
    return {
      product: product.getReturnableProps(),
      statusCode: HttpStatus.CREATED,
      message: "Produto cadastrado com sucesso.",
    }
  }

  @Get("get")
  @ApiOperation({ summary: "Procurar produto por identificador, slug ou código de barras." })
  @ApiQuery({ name: "id", required: false, example: "8431f370-4687-4fad-9d41-5bd5dde566b6" })
  @ApiQuery({ name: "slug", required: false, example: "cafe-em-grao_a1b2c3d4e5" })
  @ApiQuery({ name: "barcode", required: false, example: "5601234567890" })
  @ApiOkResponse({ description: "Produto encontrado com sucesso.", type: ProductSuccessResponseDto })
  @ApiNotFoundResponse({ description: "Produto não encontrado." })
  async get(@Query("id") id?: string, @Query("slug") slug?: string, @Query("barcode") barcode?: string) {
    const product = await this.productGetter.execute({ id, slug, barcode })
    return {
      product: product.getReturnableProps(),
      statusCode: HttpStatus.OK,
      message: "Produto encontrado com sucesso.",
    }
  }

  @Get("get-many")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Listar produtos de um workspace com paginação e filtros." })
  @ApiQuery({ name: "workspace_id", required: true, example: "c2c44511-e3ab-43d5-a81f-4a03d63021a2" })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 15 })
  @ApiQuery({ name: "last_id", required: false, example: "8431f370-4687-4fad-9d41-5bd5dde566b6" })
  @ApiQuery({ name: "slug_filter", required: false, example: "cafe" })
  @ApiQuery({ name: "name_filter", required: false, example: "Café" })
  @ApiQuery({ name: "barcode_filter", required: false, example: "5601234567890" })
  @ApiOkResponse({ description: "Produtos listados com sucesso.", type: ProductsSuccessResponseDto })
  async getMany(
    @Query("workspace_id", new ParseUUIDPipe()) workspaceId: string,
    @Query("limit") limit?: number,
    @Query("last_id") lastId?: string,
    @Query("slug_filter") slugFilter?: string,
    @Query("name_filter") nameFilter?: string,
    @Query("barcode_filter") barcodeFilter?: string,
  ) {
    const products = await this.productsGetter.execute({
      workspaceId: new IdVO(workspaceId),
      lastId,
      limit,
      slugFilter,
      nameFilter,
      barcodeFilter,
    })
    return {
      products: products.map((product) => product.getReturnableProps()),
      statusCode: HttpStatus.OK,
      message: products.length === 0 ? "Produtos não encontrados." : "Busca de produtos realizada com sucesso.",
    }
  }

  @Put("update/:id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Atualizar dados de um produto." })
  @ApiParam({ name: "id", description: "UUID do produto.", example: "8431f370-4687-4fad-9d41-5bd5dde566b6" })
  @ApiOkResponse({ description: "Produto atualizado com sucesso.", type: ProductSuccessResponseDto })
  @ApiConflictResponse({ description: "Já existe um produto com este código de barras." })
  @ApiNotFoundResponse({ description: "Produto não encontrado." })
  async update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    const product = await this.productUpdater.execute({
      productId: new IdVO(id),
      data: { ...dto },
    })
    return {
      product: product.getReturnableProps(),
      statusCode: HttpStatus.OK,
      message: "Produto atualizado com sucesso.",
    }
  }

  @Delete("delete/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Apagar um produto." })
  @ApiParam({ name: "id", description: "UUID do produto.", example: "8431f370-4687-4fad-9d41-5bd5dde566b6" })
  @ApiOkResponse({ description: "Produto apagado com sucesso.", type: DeleteProductSuccessResponseDto })
  @ApiNotFoundResponse({ description: "Produto não encontrado." })
  async delete(@Param("id") id: string) {
    await this.productDeleter.execute(new IdVO(id))
    return {
      isDeleted: true,
      statusCode: HttpStatus.OK,
      message: "Produto apagado com sucesso.",
    }
  }
}
