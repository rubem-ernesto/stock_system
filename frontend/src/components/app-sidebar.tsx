"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Package,
  ArrowLeftRight,
  PlusCircle,
  BarChart3,
  Building2,
  Users,
} from "lucide-react";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const items = [
    {
      href: "/dashboard",
      label: "Visão Geral",
      icon: BarChart3,
      exact: true,
    },
    {
      href: "/dashboard/products",
      label: "Gestão de Produtos",
      icon: Package,
      exact: true,
    },
    {
      href: "/dashboard/products/new",
      label: "Cadastrar Produto",
      icon: PlusCircle,
      exact: true,
    },
    {
      href: "/dashboard/movements",
      label: "Faturas & Movimentos",
      icon: ArrowLeftRight,
      exact: false,
    },
    {
      href: "/dashboard/workspaces",
      label: "Workspaces",
      icon: Building2,
      exact: false,
    },
    {
      href: "/dashboard/users",
      label: "Utilizadores",
      icon: Users,
      exact: false,
    },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
            Plataforma
          </SidebarGroupLabel>
          <SidebarMenu>
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} className="w-full">
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      className="hover:bg-muted/80 transition-colors w-full cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
