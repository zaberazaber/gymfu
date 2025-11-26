import mongoose, { Schema, Document } from 'mongoose';

export interface IAIInteraction extends Document {
  userId: string;
  type: 'workout_analysis' | 'nutrition_analysis' | 'progress_analysis' | 'chat' | 'workout_plan' | 'wellness' | 'gym_insights';
  prompt: string;
  response: string;
  provider: string;
  tokensUsed: number;
  cached: boolean;
  timestamp: Date;
}

const AIInteractionSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['workout_analysis', 'nutrition_analysis', 'progress_analysis', 'chat', 'workout_plan', 'wellness', 'gym_insights'],
    index: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
    enum: ['openai', 'gemini', 'huggingface', 'cached', 'unknown'],
  },
  tokensUsed: {
    type: Number,
    required: true,
    default: 0,
  },
  cached: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
AIInteractionSchema.index({ userId: 1, type: 1, timestamp: -1 });

export default mongoose.model<IAIInteraction>('AIInteraction', AIInteractionSchema);
