"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { getIssues } from "@/app/lib/api";
import ThemeToggle from "@/app/components/theme-toggle";
import IssueCharts from "./issue-charts";

type DashboardUser = {
  id: number;
  name?: string;
  email: string;
  role: "ADMIN" | "STANDARD";
};

export default function DashboardClient({
  user,
}: {
  user: DashboardUser;
}) {
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedToId, setAssignedToId] = useState("");

  const { data: issues = [], isLoading, error } = useQuery({
    queryKey: [
      "issues",
      status,
      priority,
      assignedToId,
    ],
    queryFn: () =>
      getIssues({
        status,
        priority,
        assignedToId,
      }),
  });

  const totalIssues = issues.length;

  const openIssues = issues.filter(
    (issue) => issue.status === "OPEN"
  ).length;

  const inProgressIssues = issues.filter(
    (issue) => issue.status === "IN_PROGRESS"
  ).length;

  const resolvedIssues = issues.filter(
    (issue) => issue.status === "RESOLVED"
  ).length;

  const closedIssues = issues.filter(
    (issue) => issue.status === "CLOSED"
  ).length;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              I-TRACK
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 break-all text-sm text-slate-600 dark:text-slate-400">
              Welcome, {user.name}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <ThemeToggle />

            <div className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Role
              </p>

              <p className="text-sm font-semibold">
                {user.role}
              </p>
            </div>

            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Statistics */}
        <section
          aria-label="Issue statistics"
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          {[
            ["Total Issues", totalIssues],
            ["Open", openIssues],
            ["In Progress", inProgressIssues],
            ["Resolved", resolvedIssues],
            ["Closed", closedIssues],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {label}
              </p>

              <p className="mt-2 text-3xl font-bold">
                {value}
              </p>
            </div>
          ))}
        </section>

        {/* Charts */}
        <div className="grid gap-6 pt-8">
          <IssueCharts issues={issues} />
        </div>

        {/* Issues */}
        <section className="mt-8">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold sm:text-xl">
                  Issues
                </h2>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Manage and track your issues.
                </p>
              </div>

              <Link
                href="/issues/new"
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center font-medium text-white transition hover:bg-blue-700 sm:w-auto"
              >
                + Create Issue
              </Link>
            </div>

            {/* Filters */}
            <div className="grid gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">

              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium"
                >
                  Status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="">All statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">
                    In Progress
                  </option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="mb-2 block text-sm font-medium"
                >
                  Priority
                </label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="">All priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="assignedTo"
                  className="mb-2 block text-sm font-medium"
                >
                  Assigned to
                </label>

                <select
                  id="assignedTo"
                  value={assignedToId}
                  onChange={(event) =>
                    setAssignedToId(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="">Everyone</option>

                  <option value={String(user.id)}>
                    Me
                  </option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Loading issues...
                </div>
              ) : error ? (
                <div className="p-8 text-center text-sm text-red-600 dark:text-red-400">
                  Failed to load issues.
                </div>
              ) : issues.length === 0 ? (
                <div className="p-8 text-center sm:p-12">
                  <p className="font-medium">
                    No issues found
                  </p>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Create your first issue to get started.
                  </p>
                </div>
              ) : (
                <table className="min-w-200 w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                    <tr>
                      <th className="px-5 py-3 font-semibold">
                        Issue
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Priority
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Status
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Created By
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Assigned To
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {issues.map((issue) => (
                      <tr
                        key={issue.id}
                        className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/issues/${issue.id}`}
                            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            #{issue.id} {issue.title}
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          {issue.priority}
                        </td>

                        <td className="px-5 py-4">
                          {issue.status}
                        </td>

                        <td className="px-5 py-4">
                          {issue.createdBy.name}
                        </td>

                        <td className="px-5 py-4">
                          {issue.assignedTo?.name || "Unassigned"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}