import { FilterQuery, QueryOptions } from "mongoose";
import { findRoomById } from "./roomService";
import ApiFeatures from "../utils/apiFeatures";
import Booking from "../models/Booking";
import { IBooking } from "../interfaces/booking";
import { BadRequestError, NotFoundError, AppError } from "../utils/appError";

// export const createBooking = async (input: Partial<IBooking>) => {
//   // Check room availability
//   const room = await findRoomById(input.room as string);
//   if (!room) throw new NotFoundError("Room not found");

//   // Convert string to Date objects
//   const checkInDate = new Date(input.checkInDate!);
//   const checkOutDate = new Date(input.checkOutDate!);

//   // Validate Dates
//   if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
//     throw new AppError("Invalid check-in or check-out date", 400);
//   }

//   // Calculate total nights
//   const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
//   const totalNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

//   if (totalNights <= 0) {
//     throw new AppError("Check-out date must be after check-in date", 400);
//   }

//   // Calculate total amount
//   const totalAmount = room.rates.basePrice * totalNights;

//   const booking = await Booking.create({
//     ...input,
//     checkInDate,
//     checkOutDate,
//     totalNights,
//     totalAmount,
//   });

//   return booking;
// };

export const createBooking = async (input: Partial<IBooking>) => {
  // Validate and find room
  const room = await findRoomById(input.room as string);
  if (!room) throw new NotFoundError("Room not found");

  // Convert dates
  const checkInDate = new Date(input.checkInDate!);
  const checkOutDate = new Date(input.checkOutDate!);

  // Validate dates
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    throw new AppError("Invalid check-in or check-out date", 400);
  }

  const totalNights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
  );

  if (totalNights <= 0) {
    throw new AppError("Check-out date must be after check-in date", 400);
  }

  const totalAmount = room.rates.basePrice * totalNights;

  // Prepare booking data with optional user field
  const bookingData: Partial<IBooking> = {
    ...input,
    checkInDate,
    checkOutDate,
    totalNights,
    totalAmount,
  };

  // You can add default payment if none provided (optional)
  if (!bookingData.payment) {
    bookingData.payment = {
      amount: totalAmount,
      currency: "USD",
      method: "cash",
      status: "pending",
    };
  }

  // Create booking in DB
  const booking = await Booking.create(bookingData);

  return booking;
};

export const findBookingById = async (id: string) => {
  const booking = await Booking.findById(id).populate("room").populate("user"); // 👉 add this to fetch user details if exists

  if (!booking) throw new NotFoundError("Booking not found");

  // Add isRegisteredUser flag dynamically
  const bookingObj = booking.toObject();
  return {
    ...bookingObj,
    isRegisteredUser: !!booking.user,
  };
};

export const findAllBookings = async (
  query: Record<string, unknown>,
  options?: QueryOptions
) => {
  const features = new ApiFeatures(Booking.find(), query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const bookings = await features.query.populate("room").populate("user"); // 👉 include user if available

  return bookings.map((booking) => {
    const bookingObj = booking.toObject();
    return {
      ...bookingObj,
      isRegisteredUser: !!booking.user,
    };
  });
};

export const updateBooking = async (
  id: string,
  input: Partial<IBooking>,
  options: QueryOptions = { new: true, runValidators: true }
) => {
  const booking = await Booking.findByIdAndUpdate(id, input, options).populate(
    "room"
  );
  if (!booking) throw new NotFoundError("Booking not found");
  return booking;
};

export const deleteBooking = async (id: string) => {
  const booking = await Booking.findByIdAndDelete(id);
  if (!booking) throw new NotFoundError("Booking not found");
  return booking;
};

export const getBookingsByUser = async (email: string) => {
  const bookings = await Booking.find({ "guest.email": email }).populate(
    "room"
  );
  return bookings;
};

export const isRoomAvailable = async (
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date
) => {
  const overlappingBooking = await Booking.findOne({
    room: roomId,
    status: { $in: ["pending", "confirmed"] },
    $or: [
      {
        checkInDate: { $lt: checkOutDate },
        checkOutDate: { $gt: checkInDate },
      },
    ],
  });

  return !overlappingBooking;
};
