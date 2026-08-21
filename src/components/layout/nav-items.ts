import { BarChart3, CalendarDays, FolderKanban, LayoutDashboard, Settings, Users } from "lucide-react";

export const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "Calendar", to: "/calendar", icon: CalendarDays },
  { label: "Team", to: "/team", icon: Users },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Settings", to: "/settings/profile", icon: Settings },
] as const;

export const mobileNavItems = navItems.filter((i) =>
  ["Dashboard", "Projects", "Calendar", "Team", "Analytics"].includes(i.label),
);
