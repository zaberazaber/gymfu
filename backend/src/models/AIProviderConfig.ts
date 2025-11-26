import mongoose, { Schema, Document } from 'mongoose';

export interface IAIProviderConfig extends Document {
  name: string;
  apiKey: string;
  endpoint: string;
  modelName: string; // Renamed from 'model' to avoid conflict with Document.model
  rateLimit: {
    requestsPerMinute: number;
    tokensPerDay: number;
  };
  currentUsage: {
    requestsThisMinute: number;
    tokensToday: number;
    lastReset: Date;
  };
  enabled: boolean;
  priority: number;
}

const AIProviderConfigSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['openai', 'gemini', 'huggingface'],
  },
  apiKey: {
    type: String,
    required: true,
  },
  endpoint: {
    type: String,
    required: true,
  },
  modelName: {
    type: String,
    required: true,
  },
  rateLimit: {
    requestsPerMinute: {
      type: Number,
      required: true,
      default: 60,
    },
    tokensPerDay: {
      type: Number,
      required: true,
      default: 10000,
    },
  },
  currentUsage: {
    requestsThisMinute: {
      type: Number,
      default: 0,
    },
    tokensToday: {
      type: Number,
      default: 0,
    },
    lastReset: {
      type: Date,
      default: Date.now,
    },
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  priority: {
    type: Number,
    required: true,
    default: 1,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IAIProviderConfig>('AIProviderConfig', AIProviderConfigSchema);
