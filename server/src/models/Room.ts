import { Schema, model } from "mongoose";
import { IRoom, RoomType } from "../interfaces/room";

const amenitySchema = new Schema({
  name: { type: String, required: true },
  description: String,
  icon: String,
});

const facilitySchema = new Schema({
  name: { type: String, required: true },
  description: String,
  available: { type: Boolean, default: true },
});

const seasonalPricingSchema = new Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  price: { type: Number, required: true },
});

const rateSchema = new Schema({
  basePrice: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  seasonalPricing: [seasonalPricingSchema],
  discount: {
    percentage: { type: Number, min: 0, max: 100 },
    amount: { type: Number, min: 0 },
  },
});

const roomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: Object.values([
        "Single",
        "Double",
        "Suite",
        "Deluxe",
        "Family",
        "Executive",
        "Presidential",
      ]),
    },
    maxOccupancy: { type: Number, required: true },
    size: String,
    bedType: String,
    rates: { type: rateSchema, required: true },
    amenities: [amenitySchema],
    facilities: [facilitySchema],
    images: { type: [String], required: true },
    isAvailable: { type: Boolean, default: true },
    roomCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const Room = model<IRoom>("Room", roomSchema);
export default Room;
