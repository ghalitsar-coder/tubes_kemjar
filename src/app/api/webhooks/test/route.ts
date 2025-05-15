import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Webhook test endpoint is working" });
}

export async function POST(req: Request) {
  try {
    // Log request headers
    const headersList = Object.fromEntries(req.headers);
    console.log("Headers received:", headersList);

    // Get the raw body
    const bodyText = await req.text();
    console.log("Raw body:", bodyText);

    // Try to parse as JSON if possible
    let bodyJson;
    try {
      bodyJson = JSON.parse(bodyText);
      console.log("Parsed JSON:", bodyJson);
    } catch (e) {
      console.log("Body is not valid JSON");
    }

    // Send success response
    return NextResponse.json({
      success: true,
      message: "Webhook test received",
      receivedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in test webhook:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
