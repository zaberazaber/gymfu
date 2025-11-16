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

export const getAllGyms = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      throw new AppError('Limit must be between 1 and 100', 400, 'INVALID_LIMIT');
    }

    if (offset < 0) {
      throw new AppError('Offset must be non-negative', 400, 'INVALID_OFFSET');
    }

    const gyms = await GymModel.findAll(limit, offset);
    const totalCount = await GymModel.count();

    res.json({
      success: true,
      data: gyms,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + gyms.length < totalCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw error;
  }
};

export const getNearbyGyms = async (req: Request, res: Response) => {
  try {
    const latitude = parseFloat(req.query.lat as string);
    const longitude = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || 5; // Default 5km
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    // Parse filter parameters
    const amenities = req.query.amenities
      ? (req.query.amenities as string).split(',').map((a) => a.trim())
      : undefined;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;

    // Validate coordinates
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      throw new AppError('Invalid latitude. Must be between -90 and 90', 400, 'INVALID_LATITUDE');
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      throw new AppError('Invalid longitude. Must be between -180 and 180', 400, 'INVALID_LONGITUDE');
    }

    // Validate radius
    if (radius < 0.1 || radius > 100) {
      throw new AppError('Radius must be between 0.1 and 100 km', 400, 'INVALID_RADIUS');
    }

    // Validate pagination
    if (limit < 1 || limit > 100) {
      throw new AppError('Limit must be between 1 and 100', 400, 'INVALID_LIMIT');
    }

    if (offset < 0) {
      throw new AppError('Offset must be non-negative', 400, 'INVALID_OFFSET');
    }

    // Validate price range
    if (minPrice !== undefined && minPrice < 0) {
      throw new AppError('Minimum price must be non-negative', 400, 'INVALID_MIN_PRICE');
    }

    if (maxPrice !== undefined && maxPrice < 0) {
      throw new AppError('Maximum price must be non-negative', 400, 'INVALID_MAX_PRICE');
    }

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      throw new AppError('Minimum price cannot be greater than maximum price', 400, 'INVALID_PRICE_RANGE');
    }

    // Build filters object
    const filters = {
      amenities,
      minPrice,
      maxPrice,
    };

    const gyms = await GymModel.findNearby(latitude, longitude, radius, limit, offset, filters);
    const totalCount = await GymModel.countNearby(latitude, longitude, radius, filters);

    logger.info(
      `Nearby gyms search: lat=${latitude}, lng=${longitude}, radius=${radius}km, ` +
        `amenities=${amenities?.join(',') || 'none'}, price=${minPrice || 0}-${maxPrice || '∞'}, found=${gyms.length}`
    );

    res.json({
      success: true,
      data: gyms,
      search: {
        latitude,
        longitude,
        radius,
      },
      filters: {
        amenities: amenities || [],
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
      },
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + gyms.length < totalCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw error;
  }
};

// Upload gym images
export const uploadGymImages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { images } = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new AppError('No images provided', 400, 'NO_IMAGES');
    }

    // Validate image URLs or base64 strings
    for (const image of images) {
      if (typeof image !== 'string' || image.trim().length === 0) {
        throw new AppError('Invalid image format', 400, 'INVALID_IMAGE');
      }
    }

    // Find gym
    const gym = await GymModel.findById(parseInt(id));

    if (!gym) {
      throw new AppError('Gym not found', 404, 'GYM_NOT_FOUND');
    }

    // Check if user owns the gym
    if (gym.ownerId !== userId) {
      throw new AppError('You do not have permission to upload images for this gym', 403, 'FORBIDDEN');
    }

    // Add images to gym
    const updatedGym = await GymModel.addImages(parseInt(id), images);

    logger.info(`Images uploaded for gym: ${id} by user ${userId}`);

    res.json({
      success: true,
      data: updatedGym,
      message: 'Images uploaded successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw error;
  }
};

// Remove gym image
export const removeGymImage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    if (!imageUrl) {
      throw new AppError('Image URL is required', 400, 'NO_IMAGE_URL');
    }

    // Find gym
    const gym = await GymModel.findById(parseInt(id));

    if (!gym) {
      throw new AppError('Gym not found', 404, 'GYM_NOT_FOUND');
    }

    // Check if user owns the gym
    if (gym.ownerId !== userId) {
      throw new AppError('You do not have permission to remove images from this gym', 403, 'FORBIDDEN');
    }

    // Remove image from gym
    const updatedGym = await GymModel.removeImage(parseInt(id), imageUrl);

    logger.info(`Image removed from gym: ${id} by user ${userId}`);

    res.json({
      success: true,
      data: updatedGym,
      message: 'Image removed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw error;
  }
};
