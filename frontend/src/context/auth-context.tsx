"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Workspace } from "@/types";
import {
  getStoredTokens,
  getStoredUser,
  setStoredTokens,
  setStoredUser,
  clearStoredTokens,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
  api,
} from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  login: (data: { accessToken: string; refreshToken: string; user: User }) => void;
  logout: () => void;
  setCurrentWorkspace: (workspace: Workspace) => void;
  reloadWorkspaces: () => Promise<void>;
  updateUserData: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadWorkspaces = async () => {
    try {
      const res = await api.getWorkspaces();
      const list = res.workspaces || [];
      setWorkspaces(list);

      const savedId = getActiveWorkspaceId();
      const match = list.find((w: Workspace) => w.id === savedId);
      if (match) {
        setCurrentWorkspaceState(match);
      } else if (list.length > 0) {
        setCurrentWorkspaceState(list[0]);
        setActiveWorkspaceId(list[0].id);
      } else {
        setCurrentWorkspaceState(null);
      }
    } catch {
      // Ignora erro se não autenticado
    }
  };

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    const stored = getStoredUser();
    if (accessToken && stored) {
      setUser(stored);
      loadWorkspaces().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (data: { accessToken: string; refreshToken: string; user: User }) => {
    setStoredTokens(data.accessToken, data.refreshToken);
    setStoredUser(data.user);
    setUser(data.user);
    loadWorkspaces().then(() => {
      router.push("/dashboard");
    });
  };

  const logout = () => {
    clearStoredTokens();
    setUser(null);
    setWorkspaces([]);
    setCurrentWorkspaceState(null);
    router.push("/login");
  };

  const setCurrentWorkspace = (workspace: Workspace) => {
    setCurrentWorkspaceState(workspace);
    setActiveWorkspaceId(workspace.id);
  };

  const reloadWorkspaces = async () => {
    await loadWorkspaces();
  };

  const updateUserData = (updated: Partial<User>) => {
    if (!user) return;
    const merged = { ...user, ...updated };
    setUser(merged);
    setStoredUser(merged);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        currentWorkspace,
        loading,
        login,
        logout,
        setCurrentWorkspace,
        reloadWorkspaces,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
