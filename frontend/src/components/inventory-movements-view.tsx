"use client";

import { useEffect, useState } from "react";
import { InventoryMovement } from "@/types";
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
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  FileText,
  Trash2,
} from "lucide-react";

export function InventoryMovementsView() {
  const { currentWorkspace } = useAuth();
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");

  const fetchMovements = async () => {
    if (!currentWorkspace?.id) return;
    try {
      setLoading(true);
      const res = await api.getInventoryMovements({
        workspace_id: currentWorkspace.id,
        type: filterType !== "ALL" ? filterType : undefined,
      });
      setMovements(res.movements || []);
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar movimentações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [currentWorkspace?.id, filterType]);

  const handleDelete = async (id: string) => {
    if (!currentWorkspace?.id) return;
    if (!confirm("Deseja anular este movimento/fatura?")) return;
    try {
      await api.deleteInventoryMovement(id, currentWorkspace.id);
      toast.success("Movimento anulado com sucesso!");
      fetchMovements();
    } catch (err: any) {
      toast.error(err.message || "Erro ao anular movimento");
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "IN":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 gap-1 font-mono">
            <ArrowDownLeft className="h-3 w-3" /> ENTRADA (IN)
          </Badge>
        );
      case "OUT":
        return (
          <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30 gap-1 font-mono">
            <ArrowUpRight className="h-3 w-3" /> SAÍDA (OUT)
          </Badge>
        );
      case "ADJUST":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 gap-1 font-mono">
            AJUSTE
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Histórico de Faturas & Movimentações
          </h2>
          <p className="text-sm text-muted-foreground">
            Registo de todas as compras, vendas e ajustes com snapshot de preços
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs rounded-md border border-input bg-background p-2"
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="IN">Apenas Entradas (IN)</option>
            <option value="OUT">Apenas Saídas (OUT)</option>
            <option value="ADJUST">Ajustes</option>
          </select>
          <Button variant="outline" size="sm" onClick={fetchMovements} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Data / Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Preço Unit.</TableHead>
              <TableHead>Total Fatura</TableHead>
              <TableHead>Nota / Ref</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                      <span>A carregar movimentações...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ArrowLeftRight className="h-8 w-8 text-muted-foreground/60" />
                      <p>Nenhuma movimentação registada para os filtros aplicados.</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              movements.map((m) => (
                <TableRow key={m.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {m.createdAt ? new Date(String(m.createdAt)).toLocaleString("pt") : "-"}
                  </TableCell>
                  <TableCell>{getTypeBadge(m.type)}</TableCell>
                  <TableCell className="text-xs font-semibold">{m.reason || "-"}</TableCell>
                  <TableCell className="font-bold">{m.quantity}</TableCell>
                  <TableCell className="text-xs">
                    {m.unitPrice != null ? `${Number(m.unitPrice).toFixed(2)} €` : "-"}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {m.totalPrice != null ? `${Number(m.totalPrice).toFixed(2)} €` : "-"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                    {m.note ? String(m.note) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={m.status === "ACTIVE" ? "outline" : "secondary"} className="text-[10px]">
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(m.id)}
                      title="Anular Movimento"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
