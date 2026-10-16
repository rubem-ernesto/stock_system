import { Module } from "@nestjs/common"
import { WORKSPACE_REPOSITORY_PORT } from "./application/ports/workspace-repository.port"
import { PrismaWorkspaceRepositoryAdapter } from "./infrastructure/adapters/prisma-workspace-repository.adapter"
import { CreateWorkspaceUseCase } from "./application/use-cases/create-workspace.use-case"
import { PrismaModule } from "src/config/prisma/prisma.module"
import { WorkspaceController } from "./presentation/controllers/workspace.controller"
import { UpdateWorkspaceUseCase } from "./application/use-cases/update-workspace.use-case"
import { DeleteWorkspaceUseCase } from "./application/use-cases/delete-workspace.use-case"
import { GetWorkspaceUseCase } from "./application/use-cases/get-workspace.use-case"
import { GetWorkspacesUseCase } from "./application/use-cases/get-workspaces.use-case"

@Module({
  imports: [PrismaModule],
  controllers: [WorkspaceController],
  providers: [
    CreateWorkspaceUseCase,
    UpdateWorkspaceUseCase,
    DeleteWorkspaceUseCase,
    GetWorkspaceUseCase,
    GetWorkspacesUseCase,
    { provide: WORKSPACE_REPOSITORY_PORT, useClass: PrismaWorkspaceRepositoryAdapter },
  ],
  exports: [
    CreateWorkspaceUseCase,
    UpdateWorkspaceUseCase,
    DeleteWorkspaceUseCase,
    GetWorkspaceUseCase,
    GetWorkspacesUseCase,
  ],
})
export class WorkspaceModule {}
