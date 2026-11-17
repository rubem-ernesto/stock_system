import { Boxes } from "lucide-react"
import Link from "next/link"
import { SignupForm } from "@/components/signup-form"
import { ModeToggle } from "@/components/mode-toggle"

export default function SignupPage() {
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
            <SignupForm />
          </div>
        </div>

        <div className="text-xs text-muted-foreground flex justify-between">
          <span>&copy; {new Date().getFullYear()} Stock System SaaS</span>
          <span>v1.0.0</span>
        </div>
      </div>

      {/* Coluna da Imagem / Cover (Estilo Vercel & Signup-02) */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 border-l border-border text-foreground overflow-hidden">
        {/* Vercel Grid & Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2 text-xs font-mono tracking-wider text-muted-foreground uppercase">
          <span className="inline-block size-2 rounded-full bg-[#0070f3] animate-pulse" />
          Quick Onboarding
        </div>

        <div className="relative z-10 space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/60 backdrop-blur text-xs">
            <span className="text-[#0070f3] font-semibold">Workspace</span> Multi-tenant pronto para escala
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Crie a sua conta e organize todo o seu armazém em minutos.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Controlo total sobre códigos de barras, produtos com quantidade mínima, histórico de faturas e auditoria de movimentações.
          </p>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground font-mono">
          Deploy & Management Ecosystem
        </div>
      </div>
    </div>
  )
}
