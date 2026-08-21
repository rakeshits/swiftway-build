import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav, WorkspaceMark } from "./app-sidebar";
import { mobileNavItems } from "./nav-items";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export function MobileNavDrawer() {
  const { mobileNavOpen, setMobileNavOpen } = useUIStore();
  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent side="left" className="w-72 bg-sidebar p-0">
        <SheetHeader className="h-14 justify-center border-b border-sidebar-border px-4">
          <SheetTitle className="text-left">
            <WorkspaceMark />
          </SheetTitle>
        </SheetHeader>
        <div className="p-3">
          <SidebarNav collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function MobileBottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 flex shrink-0 items-stretch border-t border-border bg-background/90 backdrop-blur-md md:hidden">
      {mobileNavItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: item.to === "/dashboard" }}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground transition-colors",
            "hover:text-foreground data-[status=active]:text-primary",
          )}
        >
          <item.icon className="size-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
