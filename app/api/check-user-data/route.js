import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ hasData: false }, { status: 200 });
    }

    // Find user in database
    const dbUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
      include: {
        Assessment: true,
        CoverLetter: true,
        Resume: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ hasData: false }, { status: 200 });
    }

    // Check if user has any data
    const hasData =
      dbUser.Assessment.length > 0 ||
      dbUser.CoverLetter.length > 0 ||
      dbUser.Resume !== null ||
      dbUser.bio !== null ||
      dbUser.experience !== null ||
      dbUser.skills.length > 0 ||
      dbUser.industry !== null;

    return NextResponse.json({ hasData }, { status: 200 });
  } catch (error) {
    console.error("Error checking user data:", error);
    return NextResponse.json(
      { error: "Failed to check user data" },
      { status: 500 }
    );
  }
}

