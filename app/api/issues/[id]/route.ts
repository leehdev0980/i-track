import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

const validPriorities = ["LOW", "MEDIUM", "HIGH"] as const;
const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const issueId = Number(id);

    if (!Number.isInteger(issueId)) {
      return NextResponse.json(
        { error: "Invalid issue ID" },
        { status: 400 }
      );
    }

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!issue) {
      return NextResponse.json(
        { error: "Issue not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ issue });
  } catch (error) {
    console.error("Get issue error:", error);

    return NextResponse.json(
      { error: "Something went wrong while fetching the issue" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const issueId = Number(id);

    if (!Number.isInteger(issueId)) {
      return NextResponse.json(
        { error: "Invalid issue ID" },
        { status: 400 }
      );
    }

    const existingIssue = await prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!existingIssue) {
      return NextResponse.json(
        { error: "Issue not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const data: {
      title?: string;
      description?: string;
      priority?: (typeof validPriorities)[number];
      status?: (typeof validStatuses)[number];
      assignedToId?: number | null;
    } = {};

    if (body.title !== undefined) {
      const title = body.title.trim();

      if (!title) {
        return NextResponse.json(
          { error: "Title cannot be empty" },
          { status: 400 }
        );
      }

      data.title = title;
    }

    if (body.description !== undefined) {
      const description = body.description.trim();

      if (!description) {
        return NextResponse.json(
          { error: "Description cannot be empty" },
          { status: 400 }
        );
      }

      data.description = description;
    }

    if (body.priority !== undefined) {
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { error: "Invalid priority" },
          { status: 400 }
        );
      }

      data.priority = body.priority;
    }

    if (body.status !== undefined) {
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }

      data.status = body.status;
    }

    if (body.assignedToId !== undefined) {
      if (user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Only administrators can assign issues" },
          { status: 403 }
        );
      }

      if (body.assignedToId === null || body.assignedToId === "") {
        data.assignedToId = null;
      } else {
        const assigneeId = Number(body.assignedToId);

        if (!Number.isInteger(assigneeId)) {
          return NextResponse.json(
            { error: "Invalid assignee" },
            { status: 400 }
          );
        }

        const assignee = await prisma.user.findUnique({
          where: { id: assigneeId },
        });

        if (!assignee) {
          return NextResponse.json(
            { error: "Assigned user not found" },
            { status: 404 }
          );
        }

        data.assignedToId = assigneeId;
      }
    }

    const issue = await prisma.issue.update({
      where: { id: issueId },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Issue updated successfully",
      issue,
    });
  } catch (error) {
    console.error("Update issue error:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating the issue" },
      { status: 500 }
    );
  }
}