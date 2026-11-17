"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Barcode, DollarSign, Package, AlertCircle, PlusCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarcodeScannerModal } from "@/components/barcode-scanner-modal";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

interface ProductFormProps {
  onSuccess?: () => void;
}

export function ProductForm({ onSuccess }: ProductFormProps) {
  const { currentWorkspace } = useAuth();

  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [purchasedPrice, setPurchasedPrice] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [minQuantity, setMinQuantity] = useState("5");
  const [unit, setUnit] = useState("un");
  const [loading, setLoading] = useState(false);

  const handleBarcodeScanned = (scannedCode: string) => {
    setBarcode(scannedCode);
    toast.success(`Código lido com sucesso: ${scannedCode}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentWorkspace?.id) {
      toast.error("Selecione ou crie um Workspace antes de cadastrar produtos.");
      return;
    }

    if (!barcode || !name || purchasedPrice === "" || price === "") {
      toast.error("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }

    try {
      setLoading(true);
      const res = await api.createProduct({
        workspaceId: currentWorkspace.id,
        barcode: barcode.trim(),
        name: name.trim(),
        purchasedPrice: Number(purchasedPrice),
        price: Number(price),
        quantity: Number(quantity) || 0,
        minQuantity: Number(minQuantity) || 0,
        unit: unit.trim() || "un",
      });

      toast.success(res.message || "Produto cadastrado com sucesso!");
      // Limpa os campos
      setBarcode("");
      setName("");
      setPurchasedPrice("");
      setPrice("");
      setQuantity("0");
      setMinQuantity("5");
      setUnit("un");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar produto.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentWorkspace) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center gap-3">
          <AlertCircle className="h-10 w-10 text-amber-500" />
          <h3 className="font-semibold text-lg">Nenhum Workspace Selecionado</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Para cadastrar um produto, precisa de estar num Workspace ativo. Crie ou selecione um no menu lateral.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Package className="h-5 w-5 text-primary" />
              Registo de Novo Produto
            </CardTitle>
            <CardDescription>
              Workspace ativo: <strong className="text-foreground">{currentWorkspace.name}</strong>
            </CardDescription>
          </div>
          <div>
            <BarcodeScannerModal onScan={handleBarcodeScanned} />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código de Barras com Leitor Integrado */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="barcode" className="flex items-center gap-1.5 font-medium">
                  <Barcode className="h-4 w-4 text-blue-500" />
                  Código de Barras / QR Code *
                </Label>
                <div className="flex items-center gap-2">
                  <BarcodeScannerModal
                    mode="barcode"
                    triggerText="Ler Código de Barras"
                    className="h-7 text-xs border-blue-500/30"
                    onScan={handleBarcodeScanned}
                  />
                  <BarcodeScannerModal
                    mode="qrcode"
                    triggerText="Ler QR Code"
                    className="h-7 text-xs border-indigo-500/30"
                    onScan={handleBarcodeScanned}
                  />
                </div>
              </div>
              <div className="relative">
                <Input
                  id="barcode"
                  placeholder="Ex: 5601234567890 (use a câmara acima para preencher automaticamente)"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  required
                  className="font-mono text-sm tracking-wider pr-10"
                />
                {barcode && (
                  <div className="absolute right-3 top-2.5 text-emerald-500 flex items-center">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Ao clicar em &quot;Ler Código de Barras&quot; ou &quot;Ler QR Code&quot;, aponte a câmara e o valor entrará aqui automaticamente.
              </p>
            </div>

            {/* Nome do Produto */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                placeholder="Ex: Café em Grão Torrado 1kg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Preço de Compra */}
            <div className="space-y-2">
              <Label htmlFor="purchasedPrice">Preço de Compra (€ / R$) *</Label>
              <div className="relative">
                <Input
                  id="purchasedPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={purchasedPrice}
                  onChange={(e) => setPurchasedPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Preço de Venda */}
            <div className="space-y-2">
              <Label htmlFor="price">Preço de Venda (€ / R$) *</Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Quantidade Inicial */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade Inicial em Stock *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            {/* Quantidade Mínima de Alerta */}
            <div className="space-y-2">
              <Label htmlFor="minQuantity">Quantidade Mínima de Stock *</Label>
              <Input
                id="minQuantity"
                type="number"
                min="0"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                required
              />
            </div>

            {/* Unidade */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="unit">Unidade de Medida</Label>
              <Input
                id="unit"
                placeholder="un, kg, cx, l, m..."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBarcode("");
                setName("");
                setPurchasedPrice("");
                setPrice("");
                setQuantity("0");
              }}
            >
              Limpar Campos
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              {loading ? "A guardar produto..." : "Cadastrar Produto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
