import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppSidebar } from "./app-sidebar";
import { TopBar } from "./top-bar";
import { MobileBottomNav, MobileNavDrawer } from "./mobile-nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUIStore } from "@/stores/ui-store";

export function AppShell() {
  const theme = useUIStore((s) => s.theme);
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.style.colorScheme = theme;
  }, [theme]);

  // Tablet widths default to the icon-rail sidebar.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (max-width: 1119px)");
    const apply = () => mq.matches && setSidebarCollapsed(true);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [setSidebarCollapsed]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <MobileNavDrawer />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto w-full max-w-[1400px]">
              <Outlet />
            </div>
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </TooltipProvider>
  );
}
