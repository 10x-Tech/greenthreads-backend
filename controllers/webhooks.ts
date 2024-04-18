import {Request, Response} from "express";
import {Webhook} from "svix";
import prisma from "../lib/prisma";
import {clerkClient} from "@clerk/clerk-sdk-node";

// sync clerk user with database
export const syncUser = async (req: Request, res: Response) => {
  // Check if the 'Signing Secret' from the Clerk Dashboard was correctly provided
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("You need a WEBHOOK_SECRET in your .env");
  }

  // Grab the headers and body
  const headers = req.headers;
  const payload = req.body;

  // Get the Svix headers for verification
  const svix_id = headers["svix-id"] as string;
  const svix_timestamp = headers["svix-timestamp"] as string;
  const svix_signature = headers["svix-signature"] as string;

  // If there are missing Svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({
      success: false,
      message: "Error occured -- no svix headers",
    });
  }

  // Initiate Svix
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: Event;

  // Attempt to verify the incoming webhook
  // If successful, the payload will be available from 'evt'
  // If the verification fails, error out and  return error code
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as Event;
  } catch (err: any) {
    // Console log and return error
    console.log("Webhook failed to verify. Error:", err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Grab the TYPE of the Webhook
  const eventType = evt.type;

  const {id, first_name, last_name, image_url} = evt.data;

  if (eventType === "user.created") {
    const email = evt.data.email_addresses?.[0]?.email_address;
    // const domain = email.split("@")[1];

    // const domainFound = await prisma.domain.findUnique({
    //   where: {
    //     name: domain,
    //   },
    //   include: {
    //     university: true,
    //   },
    // });

    const profile = await prisma.profile.create({
      data: {
        fullName: ((first_name || "") + " " + (last_name || "")).trim() || null,
        avatarUrl: image_url as string,
        externalId: id as string,
        email: email,
        // university: {
        //   connect: {
        //     id: domainFound?.universityId as string,
        //   },
        // },
      },
    });

    await clerkClient.users.updateUserMetadata(id, {
      publicMetadata: {
        profileId: profile.id,
      },
    });
  } else if (eventType === "user.updated") {
    await prisma.profile.update({
      data: {
        fullName: ((first_name || "") + " " + (last_name || "")).trim(),
        ...(image_url && {avatarUrl: image_url as string}),
      },
      where: {
        externalId: id as string,
      },
    });
  } else if (eventType === "user.deleted") {
    const {deleted} = evt.data;

    if (deleted) {
      await prisma.profile.update({
        data: {
          deleted: true,
        },
        where: {
          externalId: id as string,
        },
      });
    }
  } else if (eventType === "session.created") {
    console.log(eventType, evt.data);
  } else if (eventType === "session.ended" || eventType === "session.removed") {
    console.log(eventType, evt.data);
  }

  return res.status(200).json({
    success: true,
    message: "Webhook received",
  });
};

type EventType =
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "session.created"
  | "session.ended"
  | "session.removed";

type Event = {
  data: Record<string, any>;
  object: "event";
  type: EventType;
};
