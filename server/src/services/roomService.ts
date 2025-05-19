import { FilterQuery, QueryOptions } from "mongoose";
import ApiFeatures from "../utils/apiFeatures";
import { AppError, NotFoundError } from "../utils/appError";
import Booking from "../models/Booking";
import Room from "../models/Room";
import { IRoom } from "../interfaces/room";

export const createRoom = async (input: Partial<IRoom>) => {
  const existingRoom = await Room.findOne({ name: input.name });
  if (existingRoom) {
    throw new AppError("Room name already exists", 409);
  }

  const room = await Room.create(input);
  return room;
};

export const findRoomById = async (id: string) => {
  const room = await Room.findById(id);
  if (!room) throw new NotFoundError("Room not found");
  return room;
};

export const findAllRooms = async (
  query: Record<string, unknown>,
  options?: QueryOptions
) => {
  const features = new ApiFeatures(Room.find(), query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const rooms = await features.query;
  return rooms;
};

export const updateRoom = async (
  id: string,
  input: Partial<IRoom>,
  options: QueryOptions = { new: true, runValidators: true }
) => {
  const room = await Room.findByIdAndUpdate(id, input, options);
  if (!room) throw new NotFoundError("Room not found");
  return room;
};

export const deleteRoom = async (id: string) => {
  const room = await Room.findByIdAndDelete(id);
  if (!room) throw new NotFoundError("Room not found");
  return room;
};

export const checkRoomAvailability = async (
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date
) => {
  const room = await Room.findById(roomId);
  if (!room) throw new NotFoundError("Room not found");

  // Check if room is marked as available
  if (!room.isAvailable) return false;

  // Check if there are enough rooms available
  const overlappingBookings = await Booking.countDocuments({
    room: roomId,
    checkOutDate: { $gt: checkInDate },
    checkInDate: { $lt: checkOutDate },
    status: { $nin: ["cancelled", "no-show"] },
  });

  return room.roomCount > overlappingBookings;
};
