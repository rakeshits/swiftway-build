import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { ThroughputPoint } from "@/features/workspace/types";

export function ThroughputChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-32" />
      <div className="flex h-[240px] items-end gap-2">
        {Array.from({ length: 14 }).map((_, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${35 + ((i * 37) % 60)}%` }} />
        ))}
      </div>
    </div>
  );
}

export function ThroughputChart({ data }: { data: ThroughputPoint[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="completedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="createdFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--popover-foreground)",
            }}
            labelStyle={{ color: "var(--muted-foreground)" }}
          />
          <Area
            type="monotone"
            dataKey="created"
            name="Created"
            stroke="var(--chart-2)"
            strokeWidth={1.5}
            fill="url(#createdFill)"
          />
          <Area
            type="monotone"
            dataKey="completed"
            name="Completed"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#completedFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
