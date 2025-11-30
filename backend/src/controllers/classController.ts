import { Request, Response } from 'express';
import ClassModel from '../models/Class';
import InstructorModel from '../models/Instructor';

/**
 * Get all classes with optional filters
 * GET /api/v1/classes
 */
export const getClasses = async (req: Request, res: Response) => {
  try {
    const { type, gymId } = req.query;

    const filters: { type?: string; gymId?: number } = {};
    
    if (type && typeof type === 'string') {
      filters.type = type;
    }
    
    if (gymId) {
      filters.gymId = parseInt(gymId as string);
    }

    const classes = await ClassModel.findAll(filters);

    res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes',
      error: error.message,
    });
  }
};

/**
 * Get class by ID with full details
 * GET /api/v1/classes/:id
 */
export const getClassById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const classId = parseInt(id);

    if (isNaN(classId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID',
      });
    }

    const classData = await ClassModel.findByIdWithDetails(classId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    res.status(200).json({
      success: true,
      data: classData,
    });
  } catch (error: any) {
    console.error('Error fetching class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class',
      error: error.message,
    });
  }
};

/**
 * Get classes by gym ID
 * GET /api/v1/gyms/:gymId/classes
 */
export const getClassesByGym = async (req: Request, res: Response) => {
  try {
    const { gymId } = req.params;
    const gymIdNum = parseInt(gymId);

    if (isNaN(gymIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gym ID',
      });
    }

    const classes = await ClassModel.findByGymId(gymIdNum);

    res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (error: any) {
    console.error('Error fetching gym classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gym classes',
      error: error.message,
    });
  }
};

/**
 * Get all instructors
 * GET /api/v1/instructors
 */
export const getInstructors = async (req: Request, res: Response) => {
  try {
    const instructors = await InstructorModel.findAll();

    res.status(200).json({
      success: true,
      data: instructors,
    });
  } catch (error: any) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructors',
      error: error.message,
    });
  }
};

/**
 * Get instructor by ID
 * GET /api/v1/instructors/:id
 */
export const getInstructorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const instructorId = parseInt(id);

    if (isNaN(instructorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid instructor ID',
      });
    }

    const instructor = await InstructorModel.findById(instructorId);

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: instructor,
    });
  } catch (error: any) {
    console.error('Error fetching instructor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructor',
      error: error.message,
    });
  }
};
