import { Types, QueryOptions } from "mongoose";
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
  const roomInput = input.room as (string | Types.ObjectId)[];
  if (!Array.isArray(roomInput) || roomInput.length === 0) {
    throw new AppError("At least one room must be selected", 400);
  }

  // Convert all to ObjectId
  const roomIds: Types.ObjectId[] = roomInput.map((id) =>
    typeof id === "string" ? new Types.ObjectId(id) : id
  );

  // Convert dates
  const checkInDate = new Date(input.checkInDate!);
  const checkOutDate = new Date(input.checkOutDate!);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    throw new AppError("Invalid check-in or check-out date", 400);
  }

  const totalNights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
  );

  if (totalNights <= 0) {
    throw new AppError("Check-out date must be after check-in date", 400);
  }

  // Fetch and validate rooms
  const rooms = await Promise.all(
    roomIds.map((id) => findRoomById(id.toString()))
  );
  if (rooms.some((r) => !r)) {
    throw new NotFoundError("One or more rooms not found");
  }

  const totalAmount = rooms.reduce((sum, room) => {
    return sum + room!.rates.basePrice * totalNights;
  }, 0);

  const bookingData: Partial<IBooking> = {
    ...input,
    room: roomIds,
    checkInDate,
    checkOutDate,
    totalNights,
    totalAmount,
  };

  if (!bookingData.payment) {
    bookingData.payment = {
      amount: totalAmount,
      currency: "USD",
      method: "cash",
      status: "pending",
    };
  }

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
  const updateData: Partial<IBooking> = { ...input };

  // If rooms are updated, validate and convert
  if (input.room) {
    const roomInput = input.room as (string | Types.ObjectId)[];
    if (!Array.isArray(roomInput) || roomInput.length === 0) {
      throw new AppError("At least one room must be selected", 400);
    }

    const roomIds: Types.ObjectId[] = roomInput.map((id) =>
      typeof id === "string" ? new Types.ObjectId(id) : id
    );

    // Validate rooms exist
    const rooms = await Promise.all(
      roomIds.map((id) => findRoomById(id.toString()))
    );
    if (rooms.some((r) => !r)) {
      throw new NotFoundError("One or more rooms not found");
    }

    updateData.room = roomIds;

    // Recalculate totalAmount if dates are present or will be updated
    let checkInDate = input.checkInDate
      ? new Date(input.checkInDate)
      : undefined;
    let checkOutDate = input.checkOutDate
      ? new Date(input.checkOutDate)
      : undefined;

    // If dates are not provided in input, fetch current booking to get dates
    if (!checkInDate || !checkOutDate) {
      const existingBooking = await Booking.findById(id);
      if (!existingBooking) throw new NotFoundError("Booking not found");

      checkInDate = checkInDate || existingBooking.checkInDate;
      checkOutDate = checkOutDate || existingBooking.checkOutDate;
    }

    if (
      isNaN(checkInDate.getTime()) ||
      isNaN(checkOutDate.getTime()) ||
      checkOutDate <= checkInDate
    ) {
      throw new AppError(
        "Invalid or inconsistent check-in/check-out dates",
        400
      );
    }

    const totalNights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
    );

    updateData.checkInDate = checkInDate;
    updateData.checkOutDate = checkOutDate;
    updateData.totalNights = totalNights;

    // Calculate totalAmount
    const totalAmount = rooms.reduce((sum, room) => {
      return sum + room!.rates.basePrice * totalNights;
    }, 0);

    updateData.totalAmount = totalAmount;

    // Update payment if not provided
    if (!input.payment) {
      updateData.payment = {
        amount: totalAmount,
        currency: "USD",
        method: "cash",
        status: "pending",
      };
    }
  } else {
    // If no rooms update but dates are updated, recalc totalNights and totalAmount
    let checkInDate = input.checkInDate
      ? new Date(input.checkInDate)
      : undefined;
    let checkOutDate = input.checkOutDate
      ? new Date(input.checkOutDate)
      : undefined;

    if (checkInDate || checkOutDate) {
      // Fetch current booking to get other date if missing and room ids
      const existingBooking = await Booking.findById(id);
      if (!existingBooking) throw new NotFoundError("Booking not found");

      checkInDate = checkInDate || existingBooking.checkInDate;
      checkOutDate = checkOutDate || existingBooking.checkOutDate;

      if (
        isNaN(checkInDate.getTime()) ||
        isNaN(checkOutDate.getTime()) ||
        checkOutDate <= checkInDate
      ) {
        throw new AppError(
          "Invalid or inconsistent check-in/check-out dates",
          400
        );
      }

      const totalNights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
      );

      updateData.checkInDate = checkInDate;
      updateData.checkOutDate = checkOutDate;
      updateData.totalNights = totalNights;

      // Fetch rooms from existing booking to calculate totalAmount
      const rooms = await Promise.all(
        existingBooking.room.map((id) => findRoomById(id.toString()))
      );

      const totalAmount = rooms.reduce((sum, room) => {
        return sum + room!.rates.basePrice * totalNights;
      }, 0);

      updateData.totalAmount = totalAmount;

      // Update payment if not provided
      if (!input.payment) {
        updateData.payment = {
          amount: totalAmount,
          currency: "USD",
          method: "cash",
          status: "pending",
        };
      }
    }
  }

  const booking = await Booking.findByIdAndUpdate(
    id,
    updateData,
    options
  ).populate("room");
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
