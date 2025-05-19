import { Request, Response, NextFunction } from "express";
import {
  createBooking,
  findBookingById,
  findAllBookings,
  updateBooking,
  deleteBooking,
  getBookingsByUser,
} from "../services/bookingService";

export const createBookingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // If user is logged in, attach their ID; else leave undefined for guest
    const userId = (req as any).user?._id || null; // if no user, null
    const bookingInput = {
      ...req.body,
      user: userId,
    };

    const booking = await createBooking(bookingInput);

    res.status(201).json({
      status: "Booking created successfully",
      data: { booking },
    });
  } catch (err) {
    next(err);
  }
};

export const getBookingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = await findBookingById(req.params.id);
    res.status(200).json({
      status: "Booking fetched successfully",
      data: {
        booking,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllBookingsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await findAllBookings(req.query);
    res.status(200).json({
      status: "Bookings fetched successfully",
      results: bookings.length,
      data: {
        bookings,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateBookingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = await updateBooking(req.params.id, req.body);
    res.status(200).json({
      status: "Booking updated successfully",
      data: {
        booking,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBookingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteBooking(req.params.id);
    res.status(204).json({
      status: "Booking deleted successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserBookingsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await getBookingsByUser(req.params.email);
    res.status(200).json({
      status: "success",
      results: bookings.length,
      data: {
        bookings,
      },
    });
  } catch (err) {
    next(err);
  }
};
