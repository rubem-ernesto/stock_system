"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types";
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
import {
  Package,
  Search,
  Trash2,
  Edit,
  ArrowUpDown,
  Barcode,
  AlertTriangle,
  RefreshCw,
  Plus,
} from "lucide-react";
import { BarcodeScannerModal } from "@/components/barcode-scanner-modal";

interface ProductListProps {
  onAddNewProduct: () => void;
}

export function ProductList({ onAddNewProduct }: ProductListProps) {
  const { currentWorkspace } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [movementModalProduct, setMovementModalProduct] = useState<Product | null>(null);

  // States para movimentação rápida de estoque (IN / OUT / ADJUST)
  const [movementType, setMovementType] = useState<"IN" | "OUT" | "ADJUST">("IN");
  const [movementReason, setMovementReason] = useState<string>("COMPRA");
  const [movementQuantity, setMovementQuantity] = useState("1");
  const [movementPrice, setMovementPrice] = useState("");
  const [movementNote, setMovementNote] = useState("");
  const [movementLoading, setMovementLoading] = useState(false);

  // States para edição
  const [editName, setEditName] = useState("");
  const [editBarcode, setEditBarcode] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editPurchasedPrice, setEditPurchasedPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editMinQuantity, setEditMinQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const fetchProducts = async () => {
    if (!currentWorkspace?.id) return;
    try {
      setLoading(true);
      const res = await api.getProducts({
        workspace_id: currentWorkspace.id,
        name_filter: search || undefined,
      });
      setProducts(res.products || []);
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentWorkspace?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem a certeza que deseja apagar o produto "${name}"?`)) return;
    try {
      await api.deleteProduct(id);
      toast.success("Produto apagado com sucesso!");
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Erro ao apagar produto");
    }
  };

  const openEditModal = (p: Product) => {
    setEditProduct(p);
    setEditName(p.name);
    setEditBarcode(p.barcode);
    setEditPrice(String(p.price));
    setEditPurchasedPrice(String(p.purchasedPrice));
    setEditQuantity(String(p.quantity));
    setEditMinQuantity(String(p.minQuantity));
    setEditUnit(p.unit || "un");
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    try {
      setEditLoading(true);
      await api.updateProduct(editProduct.id, {
        name: editName,
        barcode: editBarcode,
        price: Number(editPrice),
        purchasedPrice: Number(editPurchasedPrice),
        quantity: Number(editQuantity),
        minQuantity: Number(editMinQuantity),
        unit: editUnit,
      });
      toast.success("Produto atualizado com sucesso!");
      setEditProduct(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar produto");
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementModalProduct || !currentWorkspace) return;

    try {
      setMovementLoading(true);
      await api.createInventoryMovement({
        workspaceId: currentWorkspace.id,
        productId: movementModalProduct.id,
        type: movementType,
        reason: movementReason as any,
        quantity: Number(movementQuantity),
        unitPrice: movementPrice ? Number(movementPrice) : undefined,
        note: movementNote || undefined,
      });
      toast.success(`Movimento (${movementType}) registado com sucesso!`);
      setMovementModalProduct(null);
      setMovementNote("");
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Erro ao registar movimento");
    } finally {
      setMovementLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.barcode.toLowerCase().includes(term) ||
      p.slug.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header com busca e ações */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Buscar
          </Button>
          <BarcodeScannerModal
            triggerText="Scan"
            onScan={(code) => {
              setSearch(code);
              toast.info(`Filtro aplicado pelo leitor: ${code}`);
            }}
          />
        </form>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" onClick={onAddNewProduct} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Produto</TableHead>
              <TableHead>Código de Barras</TableHead>
              <TableHead>Preço Venda</TableHead>
              <TableHead>Preço Compra</TableHead>
              <TableHead>Stock Atual</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                      <span>A carregar produtos...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground/60" />
                      <p>Nenhum produto encontrado neste workspace.</p>
                      <Button size="sm" variant="outline" onClick={onAddNewProduct} className="mt-2">
                        Cadastrar Primeiro Produto
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((p) => {
                const isLowStock = p.quantity <= p.minQuantity;
                return (
                  <TableRow key={p.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{p.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{p.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <Barcode className="h-3.5 w-3.5 text-blue-400" />
                        <span>{p.barcode}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-400">
                      {Number(p.price).toFixed(2)} €
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {Number(p.purchasedPrice).toFixed(2)} €
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isLowStock ? "text-amber-400" : ""}`}>
                          {p.quantity} {p.unit || "un"}
                        </span>
                        {isLowStock && (
                          <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Mín. {p.minQuantity}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={p.status === "ACTIVE" ? "outline" : "secondary"}
                        className="text-xs"
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-950/30"
                          title="Entrada / Saída de Stock"
                          onClick={() => {
                            setMovementModalProduct(p);
                            setMovementPrice(String(p.price));
                          }}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          title="Editar dados"
                          onClick={() => openEditModal(p)}
                        >
                          <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-destructive hover:bg-destructive/10"
                          title="Apagar produto"
                          onClick={() => handleDelete(p.id, p.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Movimentação Rápida de Estoque / Fatura */}
      <Dialog
        open={!!movementModalProduct}
        onOpenChange={(open) => !open && setMovementModalProduct(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-primary" />
              Movimentar Stock: {movementModalProduct?.name}
            </DialogTitle>
            <DialogDescription>
              Registe uma entrada (compra/reposição) ou saída (venda/perda) que gera uma fatura no sistema.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateMovement} className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={movementType === "IN" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setMovementType("IN");
                  setMovementReason("COMPRA");
                }}
              >
                + Entrada (IN)
              </Button>
              <Button
                type="button"
                variant={movementType === "OUT" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setMovementType("OUT");
                  setMovementReason("VENDA");
                }}
              >
                - Saída (OUT)
              </Button>
              <Button
                type="button"
                variant={movementType === "ADJUST" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setMovementType("ADJUST");
                  setMovementReason("AJUSTE");
                }}
              >
                Ajuste
              </Button>
            </div>

            <div className="space-y-1">
              <Label>Motivo (Reason)</Label>
              <select
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value)}
                className="w-full text-sm rounded-md border border-input bg-background p-2"
              >
                <option value="VENDA">VENDA</option>
                <option value="COMPRA">COMPRA</option>
                <option value="PERDA">PERDA</option>
                <option value="DEVOLUCAO">DEVOLUÇÃO</option>
                <option value="AJUSTE">AJUSTE DE INVENTÁRIO</option>
                <option value="OUTRO">OUTRO</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Quantidade *</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="any"
                  value={movementQuantity}
                  onChange={(e) => setMovementQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Preço Unitário (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={movementPrice}
                  onChange={(e) => setMovementPrice(e.target.value)}
                  placeholder="Automático"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Nota / Nº da Fatura (opcional)</Label>
              <Input
                placeholder="Ex: Fatura #2026-FT001 ou Fornecedor XPTO"
                value={movementNote}
                onChange={(e) => setMovementNote(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMovementModalProduct(null)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={movementLoading}>
                {movementLoading ? "A registar..." : "Registar Movimento"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Produto */}
      <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateProduct} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Nome do Produto *</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label>Código de Barras *</Label>
                <BarcodeScannerModal
                  triggerText="Scan Novo"
                  onScan={(c) => setEditBarcode(c)}
                  className="h-6 text-xs"
                />
              </div>
              <Input
                value={editBarcode}
                onChange={(e) => setEditBarcode(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Preço Venda (€) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Preço Compra (€) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editPurchasedPrice}
                  onChange={(e) => setEditPurchasedPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Quantidade *</Label>
                <Input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Qtd Mínima *</Label>
                <Input
                  type="number"
                  value={editMinQuantity}
                  onChange={(e) => setEditMinQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Unidade</Label>
                <Input
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="outline" onClick={() => setEditProduct(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? "A guardar..." : "Guardar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
