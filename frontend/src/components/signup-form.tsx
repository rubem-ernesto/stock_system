"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Boxes, Lock, Mail, User, Calendar, Loader2 } from "lucide-react";

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

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("2000-01-01");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !birthdate || !password) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As palavras-passe não coincidem.");
      return;
    }

    if (password.length < 8) {
      toast.error("A palavra-passe deve ter no mínimo 8 caracteres.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.register({
        name,
        email,
        birthdate,
        password,
      });

      toast.success(res.message || "Conta criada com sucesso!");
      login({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        user: res.user,
      });
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar conta. Verifique os dados.");
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
          <h1 className="text-2xl font-bold tracking-tight">Criar Conta</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Preencha os dados abaixo para criar a sua conta no Stock System
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="name">Nome Completo</FieldLabel>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Rubem Ernesto Figueiredo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="pl-9 bg-background"
            />
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="m@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-9 bg-background"
            />
          </div>
          <FieldDescription>
            Utilizaremos este e-mail para autenticação no sistema.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="birthdate">Data de Nascimento (YYYY-MM-DD)</FieldLabel>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required
              className="pl-9 bg-background"
            />
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Palavra-passe</FieldLabel>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-9 bg-background"
            />
          </div>
          <FieldDescription>
            Mínimo 8 caracteres (1 maiúscula, 1 minúscula e 1 especial).
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirmar Palavra-passe</FieldLabel>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pl-9 bg-background"
            />
          </div>
        </Field>

        <Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A criar conta...
              </>
            ) : (
              "Criar Conta"
            )}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Já possui uma conta?{" "}
          <Link href="/login" className="underline underline-offset-4 text-primary font-medium hover:text-primary/90">
            Iniciar sessão
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
