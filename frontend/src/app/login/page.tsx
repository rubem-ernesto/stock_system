import { Boxes } from "lucide-react"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"
import { ModeToggle } from "@/components/mode-toggle"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      <div className="flex flex-col justify-between p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-foreground hover:opacity-90">
            <div className="flex size-7 items-center justify-center rounded-md bg-foreground text-background">
              <Boxes className="size-4" />
            </div>
            <span>Stock Flow</span>
          </Link>
          <ModeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center my-8">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>

        <div className="text-xs text-muted-foreground flex justify-between">
          <span>&copy; {new Date().getFullYear()} Stock System SaaS</span>
          <span>v1.0.0</span>
        </div>
      </div>

      {/* Coluna da Imagem / Cover (Estilo Vercel & Login-02) */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 border-l border-border text-foreground overflow-hidden">
        {/* Vercel Grid & Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2 text-xs font-mono tracking-wider text-muted-foreground uppercase">
          <span className="inline-block size-2 rounded-full bg-[#0070f3] animate-pulse" />
          Enterprise Inventory Cloud
        </div>

        <div className="relative z-10 space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/60 backdrop-blur text-xs">
            <span className="text-[#0070f3] font-semibold">Novo</span> Leitura por Código de Barras & QR Code nativo
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            A infraestrutura de stock desenhada com precisão e velocidade.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Monitorize níveis críticos de inventário, registe entradas de mercadoria com leitor ótico e mantenha total rastreabilidade entre múltiplos workspaces.
          </p>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground font-mono">
          Connected to NestJS Core API Engine
        </div>
      </div>
    </div>
  )
}
