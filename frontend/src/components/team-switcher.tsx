"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Building2, ChevronsUpDownIcon, PlusCircle, Check } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Workspace } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { workspaces, currentWorkspace, setCurrentWorkspace, reloadWorkspaces } = useAuth();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = React.useState("");
  const [newWorkspaceDesc, setNewWorkspaceDesc] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) {
      toast.error("O nome do workspace é obrigatório.");
      return;
    }
    try {
      setCreating(true);
      const res = await api.createWorkspace({
        name: newWorkspaceName.trim(),
        planId: 1,
        description: newWorkspaceDesc.trim() || undefined,
      });
      toast.success(res.message || "Workspace criado com sucesso!");
      setModalOpen(false);
      setNewWorkspaceName("");
      setNewWorkspaceDesc("");
      await reloadWorkspaces();
      if (res.workspace) {
        setCurrentWorkspace(res.workspace);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar workspace");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                />
              }
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentWorkspace?.name || "Sem Workspace"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {currentWorkspace ? `Plano #${currentWorkspace.planId}` : "Crie um para começar"}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Workspaces Ativos
                </DropdownMenuLabel>
                {workspaces.map((ws: Workspace) => (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => setCurrentWorkspace(ws)}
                    className="gap-2 p-2 cursor-pointer"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border bg-muted text-xs font-semibold">
                      {ws.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="flex-1 truncate">{ws.name}</span>
                    {currentWorkspace?.id === ws.id && (
                      <Check className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))}
                {workspaces.length === 0 && (
                  <div className="p-2 text-xs text-muted-foreground">
                    Nenhum workspace encontrado.
                  </div>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="gap-2 p-2 cursor-pointer"
                  onClick={() => setModalOpen(true)}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <PlusCircle className="size-4 text-primary" />
                  </div>
                  <div className="font-medium text-primary">Novo Workspace</div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Workspace</DialogTitle>
            <DialogDescription>
              Crie uma filial, loja ou armazém para organizar os seus produtos e movimentações.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="ws-name">Nome do Workspace *</Label>
              <Input
                id="ws-name"
                placeholder="Ex: Loja Central, Armazém Norte"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="ws-desc">Descrição (opcional)</Label>
              <Input
                id="ws-desc"
                placeholder="Ex: Stock principal de mercadorias"
                value={newWorkspaceDesc}
                onChange={(e) => setNewWorkspaceDesc(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "A criar..." : "Criar Workspace"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
