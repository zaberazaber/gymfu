import express from 'express';
import {
  getClasses,
  getClassById,
  getClassesByGym,
  getInstructors,
  getInstructorById,
} from '../controllers/classController';

const router = express.Router();

// Class routes
router.get('/', getClasses);
router.get('/:id', getClassById);

// Instructor routes
router.get('/instructors', getInstructors);
router.get('/instructors/:id', getInstructorById);

export default router;
