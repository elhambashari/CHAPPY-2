
import { z } from "zod";


export const messageSchema = z.object({
  sender: z.string().min(1, "Sender is required."),
  content: z
    .string()
    .min(1, "Message content cannot be empty.")
    .max(500, "Message is too long."),
});

export const dmSchema = z.object({
  sender: z.string().min(1, "Sender is required."),
  receiver: z.string().min(1, "Receiver is required."),
  content: z
    .string()
    .min(1, "Message content cannot be empty.")
    .max(500, "Message is too long."),
});
