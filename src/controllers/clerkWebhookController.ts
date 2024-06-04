import { Request, Response } from "express";
import { Webhook } from "svix";
import prisma from "@/lib/prisma";
import { CustomerDTO, VendorDTO, VendorRole } from "@/types/UserInterface";

async function createCustomer({
  username,
  email,
  fullName,
  address = "",
  externalId,
}: CustomerDTO) {
  return await prisma.user.create({
    data: {
      username,
      email,
      isActive: true,
      customer: {
        create: {
          fullName,
          externalId,
          // address,
        },
      },
    },
    include: {
      customer: true,
    },
  });
}

async function createVendor({
  username,
  email,
  fullName,
  address,
  role,
  externalId,
  phoneNumber,
}: VendorDTO) {
  return await prisma.user.create({
    data: {
      username,
      email,
      phoneNumber,
      isActive: true, // Setting isActive to true by default
      vendor: {
        create: {
          fullName,
          address,
          role,
          externalId,
        },
      },
    },
    include: {
      vendor: true,
    },
  });
}

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
  console.log(payload, "PAYLOAD");

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
  console.log(evt?.data, "EVENT");

  const { id, first_name, last_name, unsafe_metadata, username } = evt.data;
  const { phoneNumber, role } = unsafe_metadata;
  const fullName = ((first_name || "") + " " + (last_name || "")).trim();

  if (eventType === "user.created") {
    const email = evt.data.email_addresses?.[0]?.email_address;
    if (role === "SELLER" || role === "ADMIN") {
      createVendor({
        username,
        email,
        fullName,
        role: role,
        externalId: id,
        phoneNumber,
      });
    } else if (role === "CUSTOMER") {
      createCustomer({
        username,
        email,
        fullName,
        externalId: id,
        phoneNumber,
      });
    }
  } else if (eventType === "user.updated") {
    const { id, first_name, last_name, image_url, unsafe_metadata, username } =
      evt.data;
    const { phoneNumber, role } = unsafe_metadata;
    const fullName = ((first_name || "") + " " + (last_name || "")).trim();

    const userData = {
      username,
      phoneNumber,
      profileImg: image_url,
    };

    await prisma.$transaction(async (tx) => {
      let user;

      // Try to find the user in the vendor table first, then in the customer table
      if (role === "SELLER" || role === "ADMIN") {
        console.log("VENDOR");
        user = await tx.vendor.findUnique({
          where: { externalId: id },
        });
        if (user) {
          // Update user data and vendor full name in one query
          await tx.vendor.update({
            where: { externalId: id },
            data: {
              fullName,
              user: {
                update: userData,
              },
            },
          });
        }
      } else {
        console.log("CUSTOMER");

        user = await tx.customer.findUnique({
          where: { externalId: id },
        });
        if (user) {
          // Update user data and customer full name in one query
          await tx.customer.update({
            where: { externalId: id },
            data: {
              fullName,
              user: {
                update: userData,
              },
            },
          });
        }
      }

      return user;
    });
  } else if (eventType === "user.deleted") {
    const { deleted, id } = evt.data;
    let user;
    await prisma.$transaction(async (tx) => {
      user = await tx.vendor.findUnique({
        where: { externalId: id },
      });

      if (!user) {
        user = await tx.customer.findUnique({
          where: { externalId: id },
        });
      }

      if (deleted && user) {
        await tx.user.update({
          where: { userId: user.id },
          data: { isActive: false },
        });
      }

      return user;
    });
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
