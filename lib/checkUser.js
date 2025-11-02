import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    // First, check if user exists by clerkUserId
    let loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });
    
    if (loggedInUser) {
      return loggedInUser;
    }

    const email = user.emailAddresses[0]?.emailAddress;
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";

    if (!email) {
      console.error("No email address found for user");
      return null;
    }

    // Check if user exists by email (in case of re-registration after account deletion)
    const existingUserByEmail = await db.user.findUnique({
      where: {
        email: email,
      },
    });

    // If user exists with same email but different clerkUserId, update it
    // This handles the case where user deleted Clerk account and re-registered with same email
    if (existingUserByEmail) {
      loggedInUser = await db.user.update({
        where: {
          email: email,
        },
        data: {
          clerkUserId: user.id,
          name: name || existingUserByEmail.name,
          imageUrl: user.imageUrl || existingUserByEmail.imageUrl,
        },
      });
      return loggedInUser;
    }

    // Create new user if doesn't exist
    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: email,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error in checkUser:", error.message);
    // Try to return existing user even if create/update fails
    try {
      const fallbackUser = await db.user.findUnique({
        where: {
          clerkUserId: user.id,
        },
      });
      if (fallbackUser) return fallbackUser;
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError.message);
    }
    return null;
  }
};
