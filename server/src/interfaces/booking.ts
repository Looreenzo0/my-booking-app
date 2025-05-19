import { Document, Types } from "mongoose";
import { IRoom } from "./room";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no-show";

export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "paypal"
  | "bank_transfer"
  | "cash";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface IPayment {
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate?: Date;
}

export interface IGuest {
  name: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface IBooking extends Document {
  user?: Types.ObjectId;
  room: Types.ObjectId[];
  guest: IGuest;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  totalNights: number;
  status: BookingStatus;
  totalAmount: number;
  payment: IPayment;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}
