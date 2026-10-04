export type User = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STANDARD";
};

export type Issue = {
  id: number;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdById: number;
  assignedToId: number | null;
  createdAt: string;
  updatedAt: string;

  createdBy: User;
  assignedTo: User | null;
};

export async function getIssues(
  filters: {
    status?: string;
    priority?: string;
    assignedToId?: string;
  } = {}
): Promise<Issue[]> {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.priority) {
    params.set("priority", filters.priority);
  }

  if (filters.assignedToId) {
    params.set("assignedToId", filters.assignedToId);
  }

  const query = params.toString();

  const response = await fetch(
    `/api/issues${query ? `?${query}` : ""}`
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.error || "Failed to fetch issues."
    );
  }

  const data = await response.json();

  return data.issues;
}