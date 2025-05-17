import { Request, Response, NextFunction } from "express";
import {
  createRoom,
  findRoomById,
  findAllRooms,
  updateRoom,
  deleteRoom,
  checkRoomAvailability,
} from "../services/roomService";
import { BadRequestError } from "../utils/appError";

export const createRoomHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const room = await createRoom(req.body);
    res.status(201).json({
      status: "success",
      message: "Room created successfully",
      data: { room },
    });
  } catch (err) {
    next(err);
  }
};

export const getRoomHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const room = await findRoomById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        room,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllRoomsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rooms = await findAllRooms(req.query);
    res.status(200).json({
      status: "success",
      results: rooms.length,
      data: {
        rooms,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateRoomHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const room = await updateRoom(req.params.id, req.body);
    res.status(200).json({
      status: "success",
      data: {
        room,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteRoomHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteRoom(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const checkAvailabilityHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { checkInDate, checkOutDate } = req.query;

    if (!checkInDate || !checkOutDate) {
      throw new BadRequestError(
        "Both checkInDate and checkOutDate are required"
      );
    }

    const isAvailable = await checkRoomAvailability(
      req.params.id,
      new Date(checkInDate as string),
      new Date(checkOutDate as string)
    );

    res.status(200).json({
      status: "success",
      data: {
        isAvailable,
      },
    });
  } catch (err) {
    next(err);
  }
};
