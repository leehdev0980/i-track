"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/app/components/theme-toggle";

type User = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STANDARD";
};

type Issue = {
  id: number;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  assignedTo: User | null;
  comments: Comment[];
};

type Comment = {
  id: number;
  content: string;
  createdAt: string;
  user: User;
};

async function getIssue(id: string): Promise<Issue> {
  const response = await fetch(`/api/issues/${id}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load issue.");
  }

  return data.issue;
}

async function updateIssue(
  id: string,
  updates: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    assignedToId?: number | null;
  }
) {
  const response = await fetch(`/api/issues/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update issue.");
  }

  return data.issue;
}

async function addComment(id: string, content: string) {
  const response = await fetch(`/api/issues/${id}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to add comment.");
  }

  return data.comment;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function IssueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const id = String(params.id);

  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");

  const issueQuery = useQuery({
    queryKey: ["issue", id],
    queryFn: () => getIssue(id),
  });

  const updateMutation = useMutation({
    mutationFn: (updates: {
      title?: string;
      description?: string;
      priority?: string;
      status?: string;
      assignedToId?: number | null;
    }) => updateIssue(id, updates),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["issue", id],
      });

      queryClient.invalidateQueries({
        queryKey: ["issues"],
      });

      setEditing(false);
      setFormError("");
    },

    onError: (error: Error) => {
      setFormError(error.message);
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => addComment(id, content),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["issue", id],
      });

      setComment("");
    },

    onError: (error: Error) => {
      setFormError(error.message);
    },
  });

  if (issueQuery.isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-5xl py-12 text-center">
          Loading issue...
        </div>
      </main>
    );
  }

  if (issueQuery.isError || !issueQuery.data) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-5xl py-12 text-center">
          <p className="text-red-600 dark:text-red-400">
            Failed to load issue.
          </p>

          <Link
            href="/dashboard"
            className="mt-4 inline-block text-blue-600 dark:text-blue-400"
          >
            ← Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const issue = issueQuery.data;

  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const assignedValue = String(
      formData.get("assignedToId") || ""
    ).trim();

    updateMutation.mutate({
      title: String(formData.get("title") || ""),
      description: String(
        formData.get("description") || ""
      ),
      priority: String(formData.get("priority")),
      status: String(formData.get("status")),
      assignedToId: assignedValue
        ? Number(assignedValue)
        : null,
    });
  }

  function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = comment.trim();

    if (!content) {
      return;
    }

    commentMutation.mutate(content);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to dashboard
          </Link>

          <ThemeToggle />
        </header>

        {/* Main card */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="border-b border-slate-200 p-6 dark:border-slate-800 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  ISSUE #{issue.id}
                </p>

                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                  {issue.title}
                </h1>
              </div>

              <button
                type="button"
                onClick={() => setEditing(!editing)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {editing ? "Cancel Edit" : "Edit Issue"}
              </button>
            </div>
          </div>

          {editing ? (
            <form
              onSubmit={handleUpdate}
              className="space-y-6 p-6 sm:p-8"
            >
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium"
                >
                  Title
                </label>

                <input
                  id="title"
                  name="title"
                  required
                  defaultValue={issue.title}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  required
                  rows={7}
                  defaultValue={issue.description}
                  className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="priority"
                    className="mb-2 block text-sm font-medium"
                  >
                    Priority
                  </label>

                  <select
                    id="priority"
                    name="priority"
                    defaultValue={issue.priority}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-medium"
                  >
                    Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    defaultValue={issue.status}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">
                      In Progress
                    </option>
                    <option value="RESOLVED">
                      Resolved
                    </option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="assignedToId"
                    className="mb-2 block text-sm font-medium"
                  >
                    Assigned To
                  </label>

                  <input
                    id="assignedToId"
                    name="assignedToId"
                    type="number"
                    min="1"
                    defaultValue={
                      issue.assignedTo?.id ?? ""
                    }
                    placeholder="User ID"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>

              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {updateMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </form>
          ) : (
            <div className="space-y-8 p-6 sm:p-8">

              {/* Description */}
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Description
                </h2>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 sm:text-base">
                  {issue.description}
                </p>
              </div>

              {/* Metadata */}
              <div className="grid gap-5 border-y border-slate-200 py-6 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-4">

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Priority
                  </p>

                  <p className="mt-1 font-semibold">
                    {issue.priority}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Status
                  </p>

                  <p className="mt-1 font-semibold">
                    {issue.status}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Created By
                  </p>

                  <p className="mt-1 font-semibold">
                    {issue.createdBy.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Assigned To
                  </p>

                  <p className="mt-1 font-semibold">
                    {issue.assignedTo?.name ||
                      "Unassigned"}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <p>
                  Created: {formatDate(issue.createdAt)}
                </p>

                <p className="mt-1">
                  Updated: {formatDate(issue.updatedAt)}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Comments */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="border-b border-slate-200 p-6 dark:border-slate-800 sm:p-8">
            <h2 className="text-xl font-semibold">
              Comments
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Discuss this issue with your team.
            </p>
          </div>

          <div className="space-y-5 p-6 sm:p-8">
            {issue.comments.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No comments yet.
              </p>
            ) : (
              issue.comments.map((item) => (
                <article
                  key={item.id}
                  className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-medium">
                      {item.user.name}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                    {item.content}
                  </p>
                </article>
              ))
            )}

            <form
              onSubmit={handleComment}
              className="border-t border-slate-200 pt-6 dark:border-slate-800"
            >
              <label
                htmlFor="comment"
                className="mb-2 block text-sm font-medium"
              >
                Add a comment
              </label>

              <textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
                placeholder="Write a comment..."
                className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={
                    commentMutation.isPending ||
                    !comment.trim()
                  }
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {commentMutation.isPending
                    ? "Posting..."
                    : "Add Comment"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}