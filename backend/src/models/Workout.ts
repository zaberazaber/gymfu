import mongoose, { Schema, Document } from 'mongoose';

export interface IExercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  completed: boolean;
}

export interface IWorkout extends Document {
  userId: string;
  date: Date;
  exercises: IExercise[];
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  notes?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  sets: {
    type: Number,
    required: true,
    min: 1,
  },
  reps: {
    type: Number,
    required: true,
    min: 1,
  },
  weight: {
    type: Number,
    min: 0,
  },
  duration: {
    type: Number,
    min: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const WorkoutSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  exercises: {
    type: [ExerciseSchema],
    required: true,
    validate: {
      validator: (v: IExercise[]) => v.length > 0,
      message: 'At least one exercise is required',
    },
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  intensity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  completed: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
WorkoutSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IWorkout>('Workout', WorkoutSchema);
