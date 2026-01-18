import { ReactNode } from "react";
import { GraduationCap, RefreshCcw, Shield, LogOut } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logoutMutation } = useAuth();

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Professional Academic Header */}
      <header className="bg-white border-b border-primary/10 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-4 cursor-pointer group">
              <div className="w-16 h-16 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-colors">
                <GraduationCap className="w-10 h-10 text-primary" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-heading text-primary font-black tracking-tight leading-none group-hover:opacity-90 transition-opacity">
                  IIC ANNUAL TEST 2026
                </h1>
                <p className="text-sm md:text-base font-medium text-muted-foreground tracking-widest uppercase mt-1">
                  Session 2025-26
                </p>
              </div>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => logoutMutation.mutate()}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button variant="outline" size="sm" className="gap-2">
                   <Shield className="h-4 w-4" />
                   Login
                </Button>
              </Link>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRestart}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary border-slate-200"
            >
              <RefreshCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh App</span>
            </Button>
            <div className="hidden md:block">
              <div className="px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full">
                <span className="text-xs font-bold text-accent-foreground uppercase tracking-wider">
                  Official Records
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      <footer className="bg-white border-t border-border py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 IIC Education System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
