"use client";

import { useEffect, useState } from "react";
import { User } from "@/types";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Key, Edit, RefreshCw, Shield, Search } from "lucide-react";

export function UsersView() {
  const { user: currentUser, updateUserData } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Edição de utilizador
  const [editUser, setEditUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");

  // Alteração de senha
  const [pwdModalUser, setPwdModalUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers({
        limit: 50,
        name_filter: search || undefined,
      });
      setUsers(res.users || (res.user ? [res.user] : []));
    } catch {
      // Se a rota for restrita ou não trouxer lista, mostra ao menos o user logado
      if (currentUser) {
        setUsers([currentUser]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      await api.updateUser(editUser.id, {
        name,
        birthdate: birthdate ? new Date(birthdate).toISOString() : undefined,
      });
      toast.success("Utilizador atualizado com sucesso!");
      if (editUser.id === currentUser?.id) {
        updateUserData({ name });
      }
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar dados");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdModalUser) return;
    if (newPassword.length < 8) {
      toast.error("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }
    try {
      setPwdLoading(true);
      await api.updatePassword(pwdModalUser.id, {
        password: newPassword,
        newPassword: newPassword,
      });
      toast.success("Palavra-passe alterada com sucesso!");
      setPwdModalUser(null);
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar palavra-passe");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Gestão de Utilizadores
          </h2>
          <p className="text-sm text-muted-foreground">
            Contas de utilizadores registradas no backend
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Cargo / Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const isMe = u.id === currentUser?.id;
              return (
                <TableRow key={u.id} className={isMe ? "bg-primary/5" : "hover:bg-muted/30"}>
                  <TableCell className="font-semibold">
                    <div className="flex items-center gap-2">
                      <span>{u.name}</span>
                      {isMe && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                          Você
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{u.email}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{u.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Shield className="h-3 w-3 text-primary" />
                      {u.role || "NORMAL"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        title="Editar Utilizador"
                        onClick={() => {
                          setEditUser(u);
                          setName(u.name);
                          setBirthdate(u.birthdate ? u.birthdate.split("T")[0] : "");
                        }}
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-amber-500"
                        title="Alterar Senha"
                        onClick={() => {
                          setPwdModalUser(u);
                          setNewPassword("");
                        }}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Modal Editar Perfil */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Utilizador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Nome Completo</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Data de Nascimento</Label>
              <Input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Alterar Senha */}
      <Dialog open={!!pwdModalUser} onOpenChange={(open) => !open && setPwdModalUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha do Utilizador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Nova Palavra-passe</Label>
              <Input
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setPwdModalUser(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pwdLoading}>
                {pwdLoading ? "A alterar..." : "Confirmar Senha"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
