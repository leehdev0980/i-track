import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

const validPriorities = ["LOW", "MEDIUM", "HIGH"] as const;
const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assignedToId = searchParams.get("assignedToId");

    const where = {
      ...(status && validStatuses.includes(status as (typeof validStatuses)[number])
        ? { status: status as (typeof validStatuses)[number] }
        : {}),
      ...(priority &&
      validPriorities.includes(
        priority as (typeof validPriorities)[number]
      )
        ? { priority: priority as (typeof validPriorities)[number] }
        : {}),
      ...(assignedToId
        ? { assignedToId: Number(assignedToId) }
        : {}),
    };

    const issues = await prisma.issue.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
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

    return NextResponse.json({ issues });
  } catch (error) {
    console.error("Get issues error:", error);

    return NextResponse.json(
      { error: "Something went wrong while fetching issues" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title = body.title?.trim();
    const description = body.description?.trim();
    const priority = body.priority;
    const assignedToId = body.assignedToId;

    if (!title || !description || !priority) {
      return NextResponse.json(
        {
          error: "Title, description, and priority are required",
        },
        { status: 400 }
      );
    }

    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: "Invalid priority" },
        { status: 400 }
      );
    }

    let assigneeId: number | null = null;

    if (assignedToId !== undefined && assignedToId !== null && assignedToId !== "") {
      assigneeId = Number(assignedToId);

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

      if (user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Only administrators can assign issues" },
          { status: 403 }
        );
      }
    }

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        priority,
        createdById: user.id,
        assignedToId: assigneeId,
      },
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

    return NextResponse.json(
      {
        message: "Issue created successfully",
        issue,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create issue error:", error);

    return NextResponse.json(
      { error: "Something went wrong while creating the issue" },
      { status: 500 }
    );
  }
}