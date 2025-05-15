import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Tipe yang lebih spesifik untuk Clerk User
type ClerkUser = {
  id: string;
  email_addresses: {
    email_address: string;
    id: string;
  }[];
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  external_accounts?: {
    provider: string;
    provider_user_id: string;
    image_url?: string;
    email_address?: string;
  }[];
};

export async function POST(req: Request) {
  console.log("Webhook received from Clerk");

  try {
    // Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Error occured -- no svix headers", {
        status: 400,
      });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");
    console.log(`THIS IS  wh:`, wh);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occured", {
        status: 400,
      });
    }
    // Handle the webhook
    const eventType = evt.type;

    // Debug log for all events
    console.log(
      `Received webhook event type: ${eventType}`,
      JSON.stringify(evt.data).substring(0, 200) + "..."
    );

    if (eventType === "user.created" || eventType === "user.updated") {
      try {
        // Cast data ke tipe yang sesuai untuk user events
        const userData = evt.data as unknown as ClerkUser;
        const {
          id,
          email_addresses,
          first_name,
          last_name,
          image_url,
          external_accounts,
        } = userData; // Get the primary email
        const primaryEmail = email_addresses?.[0]?.email_address;

        if (!primaryEmail) {
          console.error("Error in webhook: No email found for user", id);
          return new Response("No email found", { status: 400 });
        }

        // Log OAuth information for debugging
        if (external_accounts && external_accounts.length > 0) {
          console.log(
            `Processing OAuth user: ${id}, provider: ${external_accounts[0].provider}`
          );
        }

        // Deteksi apakah user ini menggunakan Google OAuth
        const isOAuthUser = external_accounts && external_accounts.length > 0;
        const googleAccount = external_accounts?.find(
          (account) => account.provider?.toLowerCase() === "google"
        );

        // Dapatkan profile picture
        const profilePic = image_url || googleAccount?.image_url || "";

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { clerkId: id },
        });
        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { id: existingUser.id }, // Use ID instead of clerkId to avoid TypeScript errors
            data: {
              email: primaryEmail,
              name: `${first_name || ""} ${last_name || ""}`.trim(),
              isOAuthUser: isOAuthUser || false,
              profilePic: profilePic || null,
            },
          });
        } else {
          // Create new user, ensuring we have all required fields
          await prisma.user.create({
            data: {
              clerkId: id,
              email: primaryEmail,
              name: `${first_name || ""} ${last_name || ""}`.trim() || "User",
              password: "", // Empty password for OAuth users
              isOAuthUser: isOAuthUser || false,
              profilePic: profilePic || null,
            },
          });
        }

        return NextResponse.json({
          message: "User synced successfully",
          isGoogleUser: !!googleAccount,
        });
      } catch (error) {
        console.error("Error syncing user:", error);
        return new Response("Error syncing user", { status: 500 });
      }
    }
    return NextResponse.json({ message: "Webhook processed" });
  } catch (error) {
    console.error("Unhandled error in webhook handler:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
