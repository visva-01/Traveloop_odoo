import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Plane, Plus, Map, Search, Wallet, ListChecks,
  StickyNote, Share2, User, ShieldCheck, LogOut, Sparkles,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const main = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trips", label: "My Trips", icon: Plane },
  { to: "/trips/new", label: "Plan New Trip", icon: Plus },
];
const explore = [
  { to: "/explore/cities", label: "City Search", icon: Search },
  { to: "/explore/activities", label: "Activity Search", icon: Sparkles },
];
const account = [
  { to: "/profile", label: "Profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user, logout } = useAuth();
  const isActive = (p: string) => path === p || path.startsWith(p + "/");

  const renderItem = (item: { to: string; label: string; icon: typeof Plane }) => (
    <SidebarMenuItem key={item.to}>
      <SidebarMenuButton asChild isActive={isActive(item.to)} tooltip={item.label}>
        <Link to={item.to} className="flex items-center gap-2">
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{item.label}</span>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        {!collapsed ? <Logo /> : (
          <Link to="/" className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
            <span className="text-xs font-bold">T</span>
          </Link>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{main.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Discover</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{explore.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {account.map(renderItem)}
              {user?.isAdmin && renderItem({ to: "/admin", label: "Admin", icon: ShieldCheck })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        {user ? (
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => logout()}>
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sign out</span>}
          </Button>
        ) : (
          <Button asChild size="sm" className="w-full">
            <Link to="/login">{collapsed ? "→" : "Sign in"}</Link>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
