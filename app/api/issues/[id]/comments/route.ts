import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

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

    const comments = await prisma.comment.findMany({
      where: {
        issueId,
      },
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
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);

    return NextResponse.json(
      { error: "Something went wrong while fetching comments" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const issue = await prisma.issue.findUnique({
      where: {
        id: issueId,
      },
    });

    if (!issue) {
      return NextResponse.json(
        { error: "Issue not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const content = body.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        issueId,
        userId: user.id,
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
    });

    return NextResponse.json(
      {
        message: "Comment added successfully",
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create comment error:", error);

    return NextResponse.json(
      { error: "Something went wrong while adding the comment" },
      { status: 500 }
    );
  }
}