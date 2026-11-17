"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Product, InventoryMovement } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import { BarcodeScannerModal } from "@/components/barcode-scanner-modal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DashboardOverview() {
  const router = useRouter();
  const { currentWorkspace } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentWorkspace?.id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, movRes] = await Promise.all([
          api.getProducts({ workspace_id: currentWorkspace.id }).catch(() => ({ products: [] })),
          api.getInventoryMovements({ workspace_id: currentWorkspace.id, limit: 5 }).catch(() => ({ movements: [] })),
        ]);
        setProducts(prodRes.products || []);
        setMovements(movRes.movements || []);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentWorkspace?.id]);

  const totalProducts = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
  const totalStockValue = products.reduce(
    (acc, p) => acc + (Number(p.price) || 0) * (Number(p.quantity) || 0),
    0
  );
  const lowStockProducts = products.filter((p) => p.quantity <= p.minQuantity);

  return (
    <div className="space-y-8">
      {/* Hero Banner estilo Vercel */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-neutral-900/60 to-black p-6 sm:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-border text-xs text-muted-foreground font-mono mb-2">
              <span className="size-2 rounded-full bg-[#0070f3]" />
              {currentWorkspace ? `Workspace: ${currentWorkspace.name}` : "Nenhum workspace selecionado"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Painel de Controlo de Stock
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Monitore movimentações, inventário de armazéns e faturas sincronizadas com o backend NestJS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <BarcodeScannerModal
              onScan={(code) => {
                toast.success(`Código lido: ${code}`);
                router.push(`/dashboard/products?search=${encodeURIComponent(code)}`);
              }}
              triggerText="Scan Rápido"
            />
            <Link href="/dashboard/products/new">
              <Button className="gap-2 cursor-pointer">
                <PlusCircle className="h-4 w-4" />
                Novo Produto
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Estilo Vercel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-wider font-mono text-muted-foreground">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-wider font-mono text-muted-foreground">
              Unidades Físicas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{totalStockUnits}</div>
            <p className="text-xs text-muted-foreground mt-1">Total acumulado em stock</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-wider font-mono text-muted-foreground">
              Valor Estimado Venda
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#0070f3]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#0070f3]">
              {totalStockValue.toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground mt-1">Valor de venda global</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-wider font-mono text-muted-foreground">
              Abaixo do Mínimo
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${lowStockProducts.length > 0 ? "text-amber-400" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${lowStockProducts.length > 0 ? "text-amber-400" : ""}`}>
              {lowStockProducts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Produtos em nível crítico</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Seções */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos em Alerta */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Alertas de Stock Baixo
              </CardTitle>
              <CardDescription className="text-xs">Produtos que necessitam de encomenda urgente</CardDescription>
            </div>
            <Link href="/dashboard/products">
              <Button variant="ghost" size="sm" className="text-xs cursor-pointer">
                Ver todos <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Nenhum produto abaixo do estoque mínimo.
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">Barcode: {p.barcode}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {p.quantity} / {p.minQuantity} {p.unit || "un"}
                      </span>
                      <p className="text-[10px] text-muted-foreground">{Number(p.price).toFixed(2)} €</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimas Faturas / Movimentos */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#0070f3]" />
                Últimas Movimentações
              </CardTitle>
              <CardDescription className="text-xs">Entradas e saídas de stock recentes</CardDescription>
            </div>
            <Link href="/dashboard/movements">
              <Button variant="ghost" size="sm" className="text-xs cursor-pointer">
                Histórico <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Nenhuma movimentação registada recentemente.
              </div>
            ) : (
              <div className="space-y-2">
                {movements.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      {m.type === "IN" ? (
                        <div className="size-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                          <ArrowDownLeft className="size-4" />
                        </div>
                      ) : (
                        <div className="size-7 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center">
                          <ArrowUpRight className="size-4" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium">
                          {m.type === "IN" ? "Entrada" : "Saída"} ({m.reason || "Operação"})
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {m.createdAt ? new Date(String(m.createdAt)).toLocaleDateString("pt") : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-semibold">{m.quantity} un</p>
                      <p className="text-[11px] font-mono text-[#0070f3]">
                        {m.totalPrice ? `${Number(m.totalPrice).toFixed(2)} €` : "-"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
