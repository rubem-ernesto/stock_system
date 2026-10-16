import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger"
import { Request } from "express"
import { AuthGuard } from "src/auth/presentation/guards/auth.guard"
import { BadRequestResponseDto, ServerErrorResponseDto } from "src/user/presentation/dtos/comoms-responses.dtos"
import { IdVO } from "@shared/domain/value-objects/id.vo"
import { CreateWorkspaceUseCase } from "src/workspace/application/use-cases/create-workspace.use-case"
import { DeleteWorkspaceUseCase } from "src/workspace/application/use-cases/delete-workspace.use-case"
import { GetWorkspaceUseCase } from "src/workspace/application/use-cases/get-workspace.use-case"
import { GetWorkspacesUseCase } from "src/workspace/application/use-cases/get-workspaces.use-case"
import { UpdateWorkspaceUseCase } from "src/workspace/application/use-cases/update-workspace.use-case"
import { NameVO } from "src/workspace/domain/value-objects/name.vo"
import {
  CreateWorkspaceDto,
  DeleteWorkspaceSuccessResponseDto,
  WorkspaceCreatedSuccessResponseDto,
  UpdateWorkspaceDto,
  WorkspaceSuccessResponseDto,
  WorkspacesSuccessResponseDto,
} from "../dtos/workspace.dtos"

interface AuthenticatedRequest extends Request {
  user: { userId: IdVO }
}

@Controller("workspace")
@ApiTags("Workspace")
@ApiResponse({ status: 500, description: "Erro no servidor", type: ServerErrorResponseDto })
@ApiBadRequestResponse({ description: "Erro de validação dos dados enviados", type: BadRequestResponseDto })
export class WorkspaceController {
  constructor(
    private readonly workspaceCreator: CreateWorkspaceUseCase,
    private readonly workspaceUpdater: UpdateWorkspaceUseCase,
    private readonly workspaceDeleter: DeleteWorkspaceUseCase,
    private readonly workspaceGetter: GetWorkspaceUseCase,
    private readonly workspacesGetter: GetWorkspacesUseCase,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Criar workspace." })
  @ApiCreatedResponse({ description: "Workspace criado com sucesso.", type: WorkspaceCreatedSuccessResponseDto })
  @ApiConflictResponse({ description: "Já existe um workspace com esse nome para o utilizador." })
  async create(@Body() dto: CreateWorkspaceDto, @Req() request: AuthenticatedRequest) {
    const workspace = await this.workspaceCreator.execute({
      name: new NameVO(dto.name),
      ownerId: request.user.userId,
      planId: dto.planId,
      description: dto.description,
    })

    return {
      workspace: workspace.getPrimiteProps(),
      statusCode: HttpStatus.CREATED,
      message: "Workspace criado com sucesso.",
    }
  }

  @Get("get")
  @ApiOperation({ summary: "Procurar workspace por identificador ou slug." })
  @ApiQuery({ name: "id", required: false, example: "8431f370-4687-4fad-9d41-5bd5dde566b6" })
  @ApiQuery({ name: "slug", required: false, example: "loja-central_a1b2c3d4e5" })
  @ApiOkResponse({ description: "Workspace encontrado com sucesso.", type: WorkspaceSuccessResponseDto })
  @ApiNotFoundResponse({ description: "Workspace não encontrado." })
  async get(@Query("id") id?: string, @Query("slug") slug?: string) {
    const workspace = await this.workspaceGetter.execute({ id, slug })
    return {
      workspace: workspace.getPrimiteProps(),
      statusCode: HttpStatus.OK,
      message: "Workspace encontrado com sucesso.",
    }
  }

  @Get("get-many")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Listar workspaces com paginação e filtros." })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 15 })
  @ApiQuery({ name: "last_id", required: false, example: "8431f370-4687-4fad-9d41-5bd5dde566b6" })
  @ApiQuery({ name: "slug_filter", required: false, example: "loja-central" })
  @ApiQuery({ name: "name_filter", required: false, example: "Loja" })
  @ApiOkResponse({ description: "Workspaces listados com sucesso.", type: WorkspacesSuccessResponseDto })
  async getMany(@Query("limit") limit?: number, @Query("last_id") lastId?: string, @Query("slug_filter") slugFilter?: string, @Query("name_filter") nameFilter?: string) {
    const workspaces = await this.workspacesGetter.execute({ lastId, limit, slugFilter, nameFilter })

    return {
      workspaces: workspaces.map((workspace) => workspace.getPrimiteProps()),
      statusCode: HttpStatus.OK,
      message: workspaces.length === 0 ? "Workspaces não encontrados." : "Busca de workspaces realizada com sucesso.",
    }
  }

  @Put("update/:id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Atualizar dados de um workspace." })
  @ApiParam({ name: "id", description: "UUID do workspace.", example: "8431f370-4687-4fad-9d41-5bd5dde566b6" })
  @ApiOkResponse({ description: "Workspace atualizado com sucesso.", type: WorkspaceSuccessResponseDto })
  @ApiForbiddenResponse({ description: "O utilizador não é proprietário deste workspace." })
  @ApiNotFoundResponse({ description: "Workspace não encontrado." })
  async update(@Param("id") id: string, @Body() dto: UpdateWorkspaceDto, @Req() request: AuthenticatedRequest) {
    const workspace = await this.workspaceUpdater.execute({
      workspaceId: new IdVO(id),
      requesterId: request.user.userId,
      name: dto.name === undefined ? undefined : new NameVO(dto.name),
      planId: dto.planId,
      description: dto.description,
    })

    return {
      workspace: workspace.getPrimiteProps(),
      statusCode: HttpStatus.OK,
      message: "Workspace atualizado com sucesso.",
    }
  }

  @Delete("delete/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Apagar um workspace." })
  @ApiParam({ name: "id", description: "UUID do workspace.", example: "8431f370-4687-4fad-9d41-5bd5dde566b6" })
  @ApiOkResponse({ description: "Workspace apagado com sucesso.", type: DeleteWorkspaceSuccessResponseDto })
  @ApiForbiddenResponse({ description: "O utilizador não é proprietário deste workspace." })
  @ApiNotFoundResponse({ description: "Workspace não encontrado." })
  async delete(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
    await this.workspaceDeleter.execute({
      workspaceId: new IdVO(id),
      requesterId: request.user.userId,
    })
    return {
      isDeleted: true,
      statusCode: HttpStatus.OK,
      message: "Workspace apagado com sucesso.",
    }
  }
}
