"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Barcode, QrCode, Camera, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BarcodeScannerModalProps {
  onScan: (code: string) => void;
  mode?: "barcode" | "qrcode" | "both";
  triggerText?: string;
  className?: string;
}

export function BarcodeScannerModal({
  onScan,
  mode = "both",
  triggerText,
  className,
}: BarcodeScannerModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"barcode" | "qrcode">(mode === "qrcode" ? "qrcode" : "barcode");
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "html5-barcode-scanner-view";

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn("Erro ao parar scanner:", err);
      } finally {
        scannerRef.current = null;
        setScanning(false);
      }
    }
  };

  const startScanner = async (type: "barcode" | "qrcode") => {
    await stopScanner();
    setErrorMsg(null);

    try {
      const formatsToSupport =
        type === "barcode"
          ? [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
            ]
          : [Html5QrcodeSupportedFormats.QR_CODE];

      const html5QrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport,
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: type === "barcode" ? { width: 300, height: 160 } : { width: 250, height: 250 },
        aspectRatio: 1.333,
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScan(decodedText.trim());
          stopScanner();
          setOpen(false);
        },
        () => {
          // Frame sem leitura
        }
      );
      setScanning(true);
    } catch (err: any) {
      console.error("Erro câmera:", err);
      setErrorMsg(
        "Não foi possível aceder à câmara. Verifique as permissões do navegador ou se a câmara está em uso."
      );
      setScanning(false);
    }
  };

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        startScanner(activeTab);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
  }, [open, activeTab]);

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) stopScanner();
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={className || "gap-2 border-blue-500/40 text-blue-500 hover:text-blue-400 hover:border-blue-500 cursor-pointer"}
          />
        }
      >
        <Camera className="h-4 w-4" />
        {triggerText || "Scan Código / QR"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Leitor de Código de Barras / QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            type="button"
            variant={activeTab === "barcode" ? "default" : "ghost"}
            size="sm"
            className="flex-1 gap-2 cursor-pointer"
            onClick={() => {
              setActiveTab("barcode");
            }}
          >
            <Barcode className="h-4 w-4" />
            Código de Barras (EAN/UPC)
          </Button>
          <Button
            type="button"
            variant={activeTab === "qrcode" ? "default" : "ghost"}
            size="sm"
            className="flex-1 gap-2 cursor-pointer"
            onClick={() => {
              setActiveTab("qrcode");
            }}
          >
            <QrCode className="h-4 w-4" />
            QR Code
          </Button>
        </div>

        {errorMsg && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <div className="relative overflow-hidden rounded-xl border border-border bg-black min-h-[280px] flex items-center justify-center">
          <div id={scannerContainerId} className="w-full h-full min-h-[280px]" />
          {!scanning && !errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">A inicializar a câmara...</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <p className="text-xs text-muted-foreground text-center">
            Aponte a câmara para a etiqueta ou código do produto. O valor será transmitido imediatamente para o formulário.
          </p>

          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Ou digite o código manualmente..."
              className="flex-1 text-xs px-3 py-2 rounded-md border border-input bg-background"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && manualCode.trim()) {
                  e.preventDefault();
                  onScan(manualCode.trim());
                  setOpen(false);
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              disabled={!manualCode.trim()}
              onClick={() => {
                if (manualCode.trim()) {
                  onScan(manualCode.trim());
                  setOpen(false);
                }
              }}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
