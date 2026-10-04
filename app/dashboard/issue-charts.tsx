"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type IssueChartsProps = {
  issues: {
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH";
  }[];
};

const statusLabels: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const priorityLabels: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export default function IssueCharts({
  issues,
}: IssueChartsProps) {
  const statusData = Object.entries(statusLabels).map(
    ([status, label]) => ({
      name: label,
      count: issues.filter((issue) => issue.status === status).length,
    })
  );

  const priorityData = Object.entries(priorityLabels).map(
    ([priority, label]) => ({
      name: label,
      count: issues.filter(
        (issue) => issue.priority === priority
      ).length,
    })
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Status chart */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            Issues by status
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Current distribution of issue statuses.
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={statusData}
              margin={{
                top: 20,
                right: 8,
                left: -20,
                bottom: 5,
              }}
            >
              <CartesianGrid
                vertical={false}
                stroke="currentColor"
                strokeOpacity={0.08}
                strokeDasharray="4 4"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                width={40}
                tick={{
                  fontSize: 12,
                }}
              />

              <Tooltip
                cursor={{ fill: "currentColor", opacity: 0.04 }}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--card-foreground)",
                  boxShadow:
                    "0 8px 24px rgba(0, 0, 0, 0.08)",
                }}
              />

              <Bar
                dataKey="count"
                name="Issues"
                radius={[8, 8, 0, 0]}
                maxBarSize={56}
              >
                <LabelList
                  dataKey="count"
                  position="top"
                  fontSize={12}
                  fontWeight={600}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority chart */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            Issues by priority
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Current distribution of issue priorities.
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={priorityData}
              margin={{
                top: 20,
                right: 8,
                left: -20,
                bottom: 5,
              }}
            >
              <CartesianGrid
                vertical={false}
                stroke="currentColor"
                strokeOpacity={0.08}
                strokeDasharray="4 4"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                width={40}
                tick={{
                  fontSize: 12,
                }}
              />

              <Tooltip
                cursor={{ fill: "currentColor", opacity: 0.04 }}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--card-foreground)",
                  boxShadow:
                    "0 8px 24px rgba(0, 0, 0, 0.08)",
                }}
              />

              <Bar
                dataKey="count"
                name="Issues"
                radius={[8, 8, 0, 0]}
                maxBarSize={56}
              >
                <LabelList
                  dataKey="count"
                  position="top"
                  fontSize={12}
                  fontWeight={600}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}