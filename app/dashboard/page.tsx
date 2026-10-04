import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth";
import ThemeToggle from "@/app/components/theme-toggle";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

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

            <p className="mt-2 break-all text-sm text-slate-600 dark:text-slate-400 sm:text-base">
              Welcome, {user.email}
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
          </div>
        </header>

        {/* Statistics */}
        <section
          aria-label="Issue statistics"
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            ["Total Issues", "0"],
            ["Open", "0"],
            ["In Progress", "0"],
            ["Resolved", "0"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
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

        {/* Main content */}
        <section className="mt-8">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold sm:text-xl">
                  Issues
                </h2>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Manage and track your issues.
                </p>
              </div>

              <button
                type="button"
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 sm:w-auto"
              >
                + Create Issue
              </button>
            </div>

            <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700 sm:p-12">
              <p className="font-medium">
                No issues yet
              </p>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Create your first issue to get started.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}