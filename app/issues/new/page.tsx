"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewIssuePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [assignedToId, setAssignedToId] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          priority,
          ...(assignedToId
            ? { assignedToId: Number(assignedToId) }
            : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to create issue."
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">

        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to dashboard
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="border-b border-slate-200 p-6 dark:border-slate-800 sm:p-8">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              I-TRACK
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Create Issue
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Report a problem or task that needs to be tracked.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6 sm:p-8"
          >

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium"
              >
                Title
              </label>

              <input
                id="title"
                type="text"
                required
                maxLength={200}
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Describe the issue briefly"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="description"
                required
                rows={7}
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Explain the issue in detail..."
                className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            {/* Priority */}
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
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            {/* Assignment */}
            <div>
              <label
                htmlFor="assignedToId"
                className="mb-2 block text-sm font-medium"
              >
                Assigned To
              </label>

              <input
                id="assignedToId"
                type="number"
                min="1"
                value={assignedToId}
                onChange={(event) =>
                  setAssignedToId(event.target.value)
                }
                placeholder="User ID (optional)"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Leave empty to create the issue without an assignee.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
              >
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard"
                className="rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating..."
                  : "Create Issue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}