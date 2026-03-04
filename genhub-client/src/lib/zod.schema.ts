import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  category_id: z.string().min(1, "Category is required"),
  location: z.string().optional(),
  formatted_address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  start: z.string().min(1, "Start time is required"),
  end: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute").optional().nullable(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
