import { Document } from "mongoose";

export interface IAmenity {
  name: string;
  description?: string;
  icon?: string;
}

export interface IFacility {
  name: string;
  description?: string;
  available: boolean;
}

export interface ISeasonalPricing {
  startDate: Date;
  endDate: Date;
  price: number;
}

export interface IRate {
  basePrice: number;
  currency: string;
  seasonalPricing?: ISeasonalPricing[];
  discount?: {
    percentage?: number;
    amount?: number;
  };
}

export type RoomType =
  | "Single"
  | "Double"
  | "Suite"
  | "Deluxe"
  | "Family"
  | "Executive"
  | "Presidential";

export interface IRoom extends Document {
  name: string;
  description: string;
  type: RoomType;
  maxOccupancy: number;
  size?: string;
  bedType?: string;
  rates: IRate;
  amenities?: IAmenity[];
  facilities?: IFacility[];
  images: string[];
  isAvailable: boolean;
  roomCount: number;
  createdAt: Date;
  updatedAt: Date;
}
