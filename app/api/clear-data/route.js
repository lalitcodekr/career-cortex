import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function DELETE() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find user in database
    const dbUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete all user-related data in a transaction
    await db.$transaction(async (tx) => {
      // Delete assessments
      await tx.assessment.deleteMany({
        where: {
          userId: dbUser.id,
        },
      });

      // Delete cover letters
      await tx.coverLetter.deleteMany({
        where: {
          userId: dbUser.id,
        },
      });

      // Delete resume (if exists)
      const resume = await tx.resume.findUnique({
        where: {
          userId: dbUser.id,
        },
      });
      
      if (resume) {
        await tx.resume.delete({
          where: {
            userId: dbUser.id,
          },
        });
      }

      // Reset user data (but keep the user record)
      await tx.user.update({
        where: {
          id: dbUser.id,
        },
        data: {
          bio: null,
          experience: null,
          skills: [],
          industry: null,
        },
      });
    });

    return NextResponse.json(
      { message: "All data cleared successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error clearing user data:", error);
    return NextResponse.json(
      { error: "Failed to clear user data" },
      { status: 500 }
    );
  }
}

