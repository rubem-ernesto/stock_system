"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Boxes, Lock, Mail, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.login({ email, password });
      toast.success(res.message || "Login realizado com sucesso!");
      login({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        user: res.user,
      });
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Erro ao fazer login. Verifique as credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
            <Boxes className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Iniciar Sessão</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Introduza as suas credenciais para aceder ao sistema de gestão de stock
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="seu-email@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-9"
            />
          </div>
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Palavra-passe</FieldLabel>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-9"
            />
          </div>
        </Field>

        <Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A autenticar...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Não tem uma conta?{" "}
          <Link href="/signup" className="underline underline-offset-4 text-primary font-medium hover:text-primary/90">
            Criar conta
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
