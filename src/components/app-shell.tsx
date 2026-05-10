import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const path = useRouterState({ select: (r) => r.location.pathname });

  // Public routes (no shell): landing, auth, share
  const publicPaths = ["/", "/login", "/signup", "/forgot"];
  const isShare = path.startsWith("/share/");
  const isPublic = publicPaths.includes(path) || isShare;

  if (isPublic) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-border/40 backdrop-blur">
          <Link to="/" className="font-bold tracking-tight text-lg">
            Travel<span className="text-gradient">loop</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button asChild size="sm"><Link to="/dashboard">Dashboard</Link></Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
                <Button asChild size="sm"><Link to="/signup">Get started</Link></Button>
              </>
            )}
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between px-3 sm:px-5 border-b border-border/60 bg-background/70 backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user && (
                <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-full bg-muted">
                  <div className="h-6 w-6 rounded-full bg-gradient-hero grid place-items-center text-[10px] font-bold text-primary-foreground overflow-hidden">
                    {user.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" /> : user.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium pr-1">{user.name}</span>
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
