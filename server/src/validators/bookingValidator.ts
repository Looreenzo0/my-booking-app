import { z } from "zod";

const ZDateFromString = z
  .string()
  .transform((str) => new Date(str))
  .refine((d) => !isNaN(d.getTime()), { message: "Invalid date format" });

// Booking Status Schema
const BookingStatusSchema = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "no-show",
]);

// Payment Method Schema
const PaymentMethodSchema = z.enum([
  "credit_card",
  "debit_card",
  "paypal",
  "bank_transfer",
  "cash",
]);

// Payment Status Schema
const PaymentStatusSchema = z.enum([
  "pending",
  "completed",
  "failed",
  "refunded",
]);

// Guest Schema
const GuestSchema = z.object({
  name: z.string().min(1, "Guest name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(5, "Phone number is too short"),
  specialRequests: z.string().optional(),
});

// Payment Schema
const PaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("USD"),
  method: PaymentMethodSchema,
  status: PaymentStatusSchema.default("pending"),
  transactionId: z.string().optional(),
  paymentDate: ZDateFromString.optional(),
});

// Booking Schema
export const BookingSchema = z.object({
  room: z.array(z.string()).nonempty("At least one room is required"),
  guest: GuestSchema,
  checkInDate: ZDateFromString,
  checkOutDate: ZDateFromString,
  numberOfGuests: z
    .number()
    .int()
    .positive("Number of guests must be positive"),
  status: BookingStatusSchema.default("pending"),
  payment: PaymentSchema,
  specialRequests: z.string().optional(),
});
