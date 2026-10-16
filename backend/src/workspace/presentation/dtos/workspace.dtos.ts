import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger"
import { IsInt, IsOptional, IsString, Min, MinLength } from "class-validator"
import { IPrimitiveWorkspace } from "src/workspace/domain/entities/workspace.entity"

export class CreateWorkspaceDto {
  @ApiProperty({ example: "Loja Central", description: "Nome do workspace." })
  @IsString()
  @MinLength(6)
  name!: string

  @ApiProperty({ example: 1, minimum: 1, description: "Identificador do plano contratado." })
  @IsInt()
  @Min(1)
  planId!: number

  @ApiPropertyOptional({ example: "Workspace da loja principal." })
  @IsOptional()
  @IsString()
  description?: string
}

export class UpdateWorkspaceDto extends PartialType(CreateWorkspaceDto) {}

export class WorkspaceResponseDto implements IPrimitiveWorkspace {
  @ApiProperty({ example: "8431f370-4687-4fad-9d41-5bd5dde566b6" })
  id!: string

  @ApiProperty({ example: "Loja Central" })
  name!: string

  @ApiProperty({ example: "loja-central_a1b2c3d4e5" })
  slug?: string

  @ApiProperty({ example: 1 })
  planId!: number

  @ApiProperty({ example: "f846cf11-f55b-4be4-9062-bf9f7f213d29" })
  ownerId!: string

  @ApiPropertyOptional({ example: "Workspace da loja principal." })
  description?: string

  @ApiProperty({ example: "ACTIVE", enum: ["ACTIVE", "DELETED", "PADDING", "SUSPENDED"] })
  status?: "ACTIVE" | "DELETED" | "PADDING" | "SUSPENDED"

  @ApiPropertyOptional({ example: null, nullable: true })
  deletedAt?: Date | null

  @ApiPropertyOptional({ example: "2026-10-11T12:00:00.000Z", nullable: true })
  createdAt?: Date | null

  @ApiPropertyOptional({ example: "2026-10-11T12:00:00.000Z", nullable: true })
  updatedAt?: Date | null
}

export class WorkspaceSuccessResponseDto {
  @ApiProperty({ type: WorkspaceResponseDto })
  workspace!: WorkspaceResponseDto

  @ApiProperty({ example: 200 })
  statusCode!: number

  @ApiProperty({ example: "Workspace encontrado com sucesso." })
  message!: string
}

export class WorkspaceCreatedSuccessResponseDto {
  @ApiProperty({ type: WorkspaceResponseDto })
  workspace!: WorkspaceResponseDto

  @ApiProperty({ example: 201 })
  statusCode!: number

  @ApiProperty({ example: "Workspace criado com sucesso." })
  message!: string
}

export class WorkspacesSuccessResponseDto {
  @ApiProperty({ type: [WorkspaceResponseDto] })
  workspaces!: WorkspaceResponseDto[]

  @ApiProperty({ example: 200 })
  statusCode!: number

  @ApiProperty({ example: "Busca de workspaces realizada com sucesso." })
  message!: string
}

export class DeleteWorkspaceSuccessResponseDto {
  @ApiProperty({ example: true })
  isDeleted!: boolean

  @ApiProperty({ example: 200 })
  statusCode!: number

  @ApiProperty({ example: "Workspace apagado com sucesso." })
  message!: string
}
