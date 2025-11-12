import { Request, Response } from 'express';
import { GymModel, CreateGymData } from '../models/Gym';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const registerGym = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const {
      name,
      address,
      latitude,
      longitude,
      city,
      pincode,
      amenities,
      basePrice,
      capacity,
    } = req.body;

    // Create gym data
    const gymData: CreateGymData = {
      name,
      ownerId: userId,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      city,
      pincode,
      amenities: amenities || [],
      basePrice: parseFloat(basePrice),
      capacity: parseInt(capacity),
    };

    // Create gym in database
    const gym = await GymModel.create(gymData);

    logger.info(`Gym registered: ${gym.id} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: gym,
      message: 'Gym registered successfully. Pending verification.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw error;
  }
};

export const getGymById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const gym = await GymModel.findById(parseInt(id));

    if (!gym) {
      throw new AppError('Gym not found', 404, 'GYM_NOT_FOUND');
    }

    res.json({
      success: true,
      data: gym,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw error;
  }
};

export const getMyGyms = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const gyms = await GymModel.findByOwnerId(userId);

    res.json({
      success: true,
      data: gyms,
      count: gyms.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw error;
  }
};

export const updateGym = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    // Check if gym exists and belongs to user
    const existingGym = await GymModel.findById(parseInt(id));
    if (!existingGym) {
      throw new AppError('Gym not found', 404, 'GYM_NOT_FOUND');
    }

    if (existingGym.ownerId !== userId) {
      throw new AppError('Not authorized to update this gym', 403, 'FORBIDDEN');
    }

    const {
      name,
      address,
      latitude,
      longitude,
      city,
      pincode,
      amenities,
      basePrice,
      capacity,
    } = req.body;

    const updateData: Partial<CreateGymData> = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (city !== undefined) updateData.city = city;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (amenities !== undefined) updateData.amenities = amenities;
    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);

    const updatedGym = await GymModel.update(parseInt(id), updateData);

    logger.info(`Gym updated: ${id} by user ${userId}`);

    res.json({
      success: true,
      data: updatedGym,
      message: 'Gym updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw error;
  }
};

export const deleteGym = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    // Check if gym exists and belongs to user
    const existingGym = await GymModel.findById(parseInt(id));
    if (!existingGym) {
      throw new AppError('Gym not found', 404, 'GYM_NOT_FOUND');
    }

    if (existingGym.ownerId !== userId) {
      throw new AppError('Not authorized to delete this gym', 403, 'FORBIDDEN');
    }

    await GymModel.delete(parseInt(id));

    logger.info(`Gym deleted: ${id} by user ${userId}`);

    res.json({
      success: true,
      message: 'Gym deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw error;
  }
};
