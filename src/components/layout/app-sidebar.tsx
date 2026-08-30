import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronsLeft, ChevronsRight, Compass, Plus } from "lucide-react";
import { navItems } from "./nav-items";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TaskFormDialog } from "@/features/board/components/task-form-dialog";

export function WorkspaceMark({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Compass className="size-4.5" />
      </span>
      {!collapsed && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold leading-tight">Waypoint</span>
          <span className="block truncate text-xs text-muted-foreground">Northwind Labs</span>
        </span>
      )}
    </div>
  );
}

export function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const link = (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            activeOptions={{ exact: item.to === "/dashboard" }}
            className={cn(
              "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground outline-none transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              "data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground data-[status=active]:font-medium",
              collapsed && "justify-center px-0",
            )}
          >
            <item.icon className="size-4.5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );

        if (!collapsed) return link;
        return (
          <Tooltip key={item.to}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

export function AppSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out md:flex",
        sidebarCollapsed ? "w-[68px]" : "w-64",
      )}
    >
      <div className={cn("flex h-14 items-center border-b border-sidebar-border px-3", sidebarCollapsed && "justify-center px-0")}>
        <WorkspaceMark collapsed={sidebarCollapsed} />
      </div>

      <div className={cn("px-3 py-3", sidebarCollapsed && "px-2")}>
        <Button
          size="sm"
          className={cn("w-full", sidebarCollapsed && "px-0")}
          aria-label="New task"
          onClick={() => setNewTaskOpen(true)}
        >
          <Plus className="size-4" />
          {!sidebarCollapsed && "New task"}
        </Button>
      </div>

      <div className={cn("flex-1 overflow-y-auto px-3 pb-4", sidebarCollapsed && "px-2")}>
        <SidebarNav collapsed={sidebarCollapsed} />
      </div>

      <div className={cn("border-t border-sidebar-border p-2", sidebarCollapsed && "flex justify-center")}>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn("text-muted-foreground", !sidebarCollapsed && "w-full justify-start")}
        >
          {sidebarCollapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          {!sidebarCollapsed && "Collapse"}
        </Button>
      </div>

      <TaskFormDialog open={newTaskOpen} onOpenChange={setNewTaskOpen} />
    </aside>
  );
}
