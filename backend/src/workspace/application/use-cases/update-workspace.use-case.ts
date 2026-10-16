import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common"
import { UseCasePort } from "@shared/application/ports/use-case.port"
import { IdVO } from "@shared/domain/value-objects/id.vo"
import { NameVO } from "src/workspace/domain/value-objects/name.vo"
import { Workspace } from "src/workspace/domain/entities/workspace.entity"
import { WORKSPACE_REPOSITORY_PORT, WorkspaceRepositoryPort } from "../ports/workspace-repository.port"

export interface UpdateWorkspaceInput {
  name?: NameVO
  planId?: number
  description?: string
  workspaceId: IdVO
  requesterId: IdVO
}

@Injectable()
export class UpdateWorkspaceUseCase implements UseCasePort<UpdateWorkspaceInput, Workspace> {
  constructor(
    @Inject(WORKSPACE_REPOSITORY_PORT)
    private readonly workspaceRepository: WorkspaceRepositoryPort,
  ) {}

  async execute(input: UpdateWorkspaceInput): Promise<Workspace> {
    if (input.name === undefined && input.planId === undefined && input.description === undefined) {
      throw new BadRequestException("Informe pelo menos um campo para atualizar.")
    }

    const workspace = await this.workspaceRepository.findByUnique({ id: input.workspaceId.get() })

    if (!workspace) throw new HttpException("Workspace não encontrado", HttpStatus.NOT_FOUND)
    if (!input.requesterId.equals(workspace.getProps().ownerId)) {
      throw new HttpException("Não podes atualizar este workspace", HttpStatus.FORBIDDEN)
    }

    if (input.name) workspace.setName(input.name.get())
    if (input.planId !== undefined) workspace.setPlanId(input.planId)
    if (input.description !== undefined) workspace.setDescription(input.description)

    return this.workspaceRepository.update(workspace)
  }
}
