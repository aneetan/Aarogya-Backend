import { z } from "zod";

export const addCampSchema = z.object({
  body: z.object({
    name: z.string()
      .min(5, "Name must be at least 5 characters long")
      .max(100, "Name cannot exceed 100 characters")
      ,

    location: z.string()
      .min(5, "Location must be at least 5 characters long")
      .max(100, "Location cannot exceed 100 characters")
      ,

    organizer: z.string()
      .min(5, "Organizer must be at least 5 characters long")
      .max(100, "Organizer cannot exceed 100 characters")
      ,

    contact: z.string()
      .min(1, "Contact is required")
      .regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format")
      ,

    description: z.string()
      .min(10, "Description must be at least 10 characters long")
      .max(2000, "Description cannot exceed 2000 characters")
      .default(""),

    date: z.coerce.date()
      .min(new Date(), "Date cannot be in the past")
      .refine(date => date instanceof Date && !isNaN(date.getTime()), {
        message: "Invalid date format"
      }),

    days: z.coerce.number()
      .int("Days must be an integer")
      .min(1, "Minimum 1 day required")
      .max(365, "Cannot exceed 365 days")
      .default(1),

    starting_time: z.string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),

    ending_time: z.string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),

    lat: z.coerce.number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),

    lng: z.coerce.number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),

    status: z.enum(["upcoming", "active", "expired"])
      .default("upcoming")
  })
});

export type CampFormUserInput = z.infer<typeof addCampSchema>;