// app/api/webhook/register/route.ts
import { Webhook } from "svix"; 
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/app/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // allow any origin
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, svix-id, svix-signature, svix-timestamp",
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", { status: 500, headers: corsHeaders });
  }

  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_signature = (await headerPayload).get("svix-signature");    
  const svix_timestamp = (await headerPayload).get("svix-timestamp");

  if (!svix_id || !svix_signature || !svix_timestamp) {
    return new Response("Missing required headers", { status: 400, headers: corsHeaders });
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);
  if (!body) {
    return new Response("Empty request body", { status: 400, headers: corsHeaders });
  }

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-signature": svix_signature,
      "svix-timestamp": svix_timestamp,
    }) as WebhookEvent;
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return new Response("Invalid webhook signature", { status: 400, headers: corsHeaders });
  }

  const { id } = event.data;
  console.log("Webhook event received:", { id });

  const { type: eventType, data } = event;

  try {
    switch (eventType) {
      case "user.created":
        console.log("User created:", data);
        await prisma.user.create({
          data: {
            clerkId: data.id,
            email: data.email_addresses[0].email_address,
            isSubscribed: false,
          },
        });
        break;
      default:
        console.warn("Unhandled event type:", eventType);
    }
  } catch (error) {
    console.error("Error handling webhook event:", error);
    return new Response("Internal server error", { status: 500, headers: corsHeaders });
  }

  return new Response("Webhook event processed successfully", { status: 200, headers: corsHeaders });
}
