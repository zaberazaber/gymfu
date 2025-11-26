import { IAIProviderConfig } from '../models/AIProviderConfig';

export interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface AIProvider {
  name: string;
  config: IAIProviderConfig;
  isAvailable(): Promise<boolean>;
  getRemainingQuota(): Promise<number>;
  generateCompletion(prompt: string, options?: CompletionOptions): Promise<string>;
}
