import { z } from "zod";
import type { UserJSON } from "@clerk/backend";

// Schema for Clerk webhook payload
export const clerkWebhookSchema = z.object({
  data: z.object({
    id: z.string(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    email_addresses: z.array(
      z.object({
        email_address: z.string(),
        verification: z.object({
          status: z.string(),
        }),
        id: z.string(),
      })
    ),
    primary_email_address_id: z.string().nullable(),
    created_at: z.number(),
    updated_at: z.number(),
  }),
  object: z.string(),
  type: z.string(),
});

export type ClerkWebhookDto = z.infer<typeof clerkWebhookSchema>;

// DTO for creating or updating a user
export interface UserDto {
  clerkUserId: string;
  name: string;
  email: string;
}

// Helper function to transform Clerk user data to our DTO
export function transformClerkUserToDto(userData: UserJSON): UserDto {
  const primaryEmail = userData.email_addresses.find(
    (email) => email.id === userData.primary_email_address_id
  );

  return {
    clerkUserId: userData.id,
    name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim(),
    email: primaryEmail?.email_address || userData.email_addresses[0]?.email_address || "",
  };
}
