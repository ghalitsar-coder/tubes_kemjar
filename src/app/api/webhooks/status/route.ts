import { NextResponse } from "next/server";
import { getAuthFromApiRoute } from "@/lib/clerk-helper";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { userId } = await getAuthFromApiRoute(request);

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return information about Clerk webhook configuration
    return NextResponse.json({
      status: "Active",
      webhookUrl: "/api/webhooks/clerk",
      webhookSecret: process.env.CLERK_WEBHOOK_SECRET
        ? "Configured"
        : "Missing",
      clerkUserId: userId,
      webhookEvents: ["user.created", "user.updated", "user.deleted"],
      message: "Ensure webhook is properly configured in Clerk Dashboard",
      docs: "https://clerk.com/docs/users/sync-data-to-your-backend#sync-with-webhooks",
    });
  } catch (error) {
    console.error("Error checking webhook status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
