"use client";

import { useEffect, useState } from "react";
import { Workspace } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Building2, Plus, Edit, Trash2, Check, RefreshCw } from "lucide-react";

export function WorkspacesView() {
  const { workspaces, currentWorkspace, setCurrentWorkspace, reloadWorkspaces } = useAuth();
  const [loading, setLoading] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [editWorkspace, setEditWorkspace] = useState<Workspace | null>(null);

  // Formulário criação
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [planId, setPlanId] = useState("1");
  const [saving, setSaving] = useState(false);

  // Formulário edição
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPlanId, setEditPlanId] = useState("1");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.createWorkspace({
        name: name.trim(),
        planId: Number(planId) || 1,
        description: desc.trim() || undefined,
      });
      toast.success("Workspace criado com sucesso!");
      setCreateModal(false);
      setName("");
      setDesc("");
      await reloadWorkspaces();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar workspace");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWorkspace) return;
    try {
      setSaving(true);
      await api.updateWorkspace(editWorkspace.id, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
        planId: Number(editPlanId) || 1,
      });
      toast.success("Workspace atualizado com sucesso!");
      setEditWorkspace(null);
      await reloadWorkspaces();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar workspace");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, wsName: string) => {
    if (!confirm(`Deseja realmente apagar o workspace "${wsName}"?`)) return;
    try {
      await api.deleteWorkspace(id);
      toast.success("Workspace apagado com sucesso!");
      await reloadWorkspaces();
    } catch (err: any) {
      toast.error(err.message || "Erro ao apagar workspace");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Gestão de Workspaces
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie filiais, empresas ou divisões cadastradas no sistema
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => reloadWorkspaces()} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => setCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Workspace
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workspaces.map((ws) => {
              const isSelected = currentWorkspace?.id === ws.id;
              return (
                <TableRow key={ws.id} className={isSelected ? "bg-primary/5" : "hover:bg-muted/30"}>
                  <TableCell className="font-semibold flex items-center gap-2">
                    {ws.name}
                    {isSelected && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                        Ativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{ws.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Plano #{ws.planId}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{ws.description || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={ws.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                      {ws.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      {!isSelected && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-primary"
                          onClick={() => setCurrentWorkspace(ws)}
                        >
                          Ativar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                          setEditWorkspace(ws);
                          setEditName(ws.name);
                          setEditDesc(ws.description || "");
                          setEditPlanId(String(ws.planId));
                        }}
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-destructive"
                        onClick={() => handleDelete(ws.id, ws.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Modal Criar Workspace */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Workspace</DialogTitle>
            <DialogDescription>Adicione um novo espaço de trabalho para estoques.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Nome do Workspace *</Label>
              <Input
                placeholder="Ex: Armazém Lisboa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Plano (ID numérico) *</Label>
              <Input
                type="number"
                min="1"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input
                placeholder="Descrição opcional..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "A criar..." : "Criar Workspace"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Workspace */}
      <Dialog open={!!editWorkspace} onOpenChange={(open) => !open && setEditWorkspace(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Nome do Workspace *</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Plano</Label>
              <Input
                type="number"
                min="1"
                value={editPlanId}
                onChange={(e) => setEditPlanId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditWorkspace(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "A guardar..." : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
