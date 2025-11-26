import mongoose, { Schema, Document } from 'mongoose';

export interface IFitnessProfile extends Document {
  userId: string;
  goals: string[];
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  height?: number;
  weight?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  dietaryPreferences?: string[];
  medicalConditions?: string[];
  availableEquipment?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FitnessProfileSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  goals: {
    type: [String],
    default: [],
  },
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  height: {
    type: Number,
    min: 50,
    max: 300,
  },
  weight: {
    type: Number,
    min: 20,
    max: 500,
  },
  age: {
    type: Number,
    min: 13,
    max: 120,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  dietaryPreferences: {
    type: [String],
    default: [],
  },
  medicalConditions: {
    type: [String],
    default: [],
  },
  availableEquipment: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

export default mongoose.model<IFitnessProfile>('FitnessProfile', FitnessProfileSchema);
