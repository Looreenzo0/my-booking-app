import { Schema, model } from "mongoose";
import { IBooking } from "../interfaces/booking";

const paymentSchema = new Schema({
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  method: {
    type: String,
    enum: ["credit_card", "debit_card", "paypal", "bank_transfer", "cash"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  transactionId: String,
  paymentDate: Date,
});

const guestSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  specialRequests: String,
});

const bookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    room: [{ type: Schema.Types.ObjectId, ref: "Room", required: true }],
    guest: { type: guestSchema, required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    numberOfGuests: { type: Number, required: true },
    totalNights: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no-show"],
      default: "pending",
    },
    totalAmount: { type: Number, required: true },
    payment: { type: paymentSchema, required: true },
    specialRequests: String,
  },
  { timestamps: true }
);

// Indexes for better query performance
bookingSchema.index({ room: 1 });
bookingSchema.index({ "guest.email": 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });

const Booking = model<IBooking>("Booking", bookingSchema);
export default Booking;
