import { z } from "zod";

const ZDateFromString = z
  .string()
  .transform((str) => new Date(str))
  .refine((d) => !isNaN(d.getTime()), { message: "Invalid date format" });

// Amenity Schema
const AmenitySchema = z.object({
  name: z.string().min(1, "Amenity name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
});

// Facility Schema
const FacilitySchema = z.object({
  name: z.string().min(1, "Facility name is required"),
  description: z.string().optional(),
  available: z.boolean().default(true),
});

// Room Type Schema
const RoomTypeSchema = z.enum([
  "Single",
  "Double",
  "Suite",
  "Deluxe",
  "Family",
  "Executive",
  "Presidential",
]);

// Rate Schema
const RateSchema = z.object({
  basePrice: z.number().positive("Base price must be positive"),
  currency: z.string().default("USD"),
  seasonalPricing: z
    .array(
      z.object({
        startDate: ZDateFromString,
        endDate: ZDateFromString,
        price: z.number().positive(),
      })
    )
    .optional(),
  discount: z
    .object({
      percentage: z.number().min(0).max(100).optional(),
      amount: z.number().min(0).optional(),
    })
    .optional(),
});

// Room Schema
export const RoomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  description: z
    .string()
    .min(10, "Description should be at least 10 characters"),
  type: RoomTypeSchema,
  maxOccupancy: z
    .number()
    .int()
    .positive("Max occupancy must be a positive integer"),
  size: z.string().optional(),
  bedType: z.string().optional(),
  rates: RateSchema,
  amenities: z.array(AmenitySchema).optional(),
  facilities: z.array(FacilitySchema).optional(),
  images: z
    .array(z.string().url("Image must be a valid URL"))
    .min(1, "At least one image is required"),
  isAvailable: z.boolean().default(true),
  roomCount: z
    .number()
    .int()
    .nonnegative("Room count cannot be negative")
    .default(1),
});
