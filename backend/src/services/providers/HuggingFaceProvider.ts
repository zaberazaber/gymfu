import { AIProvider, CompletionOptions } from '../AIProviderTypes';
import { IAIProviderConfig } from '../../models/AIProviderConfig';

export class HuggingFaceProvider implements AIProvider {
  name: string;
  config: IAIProviderConfig;
  private client: any;

  constructor(config: IAIProviderConfig) {
    this.name = config.name;
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Dynamically import Hugging Face Inference SDK
      const { HfInference } = await import('@huggingface/inference');
      const apiKey = this.config.apiKey || process.env.HUGGINGFACE_API_KEY;
      // Initialize with API key only
      this.client = new HfInference(apiKey);
    } catch (error) {
      console.error('Error initializing Hugging Face provider:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      if (!this.client) {
        await this.initialize();
      }

      // Check if we're within rate limits
      const remainingQuota = await this.getRemainingQuota();
      return remainingQuota > 0;
    } catch (error) {
      console.error('Hugging Face availability check failed:', error);
      return false;
    }
  }

  async getRemainingQuota(): Promise<number> {
    const { requestsThisMinute, tokensToday } = this.config.currentUsage;
    const { requestsPerMinute, tokensPerDay } = this.config.rateLimit;

    const remainingRequests = requestsPerMinute - requestsThisMinute;
    const remainingTokens = tokensPerDay - tokensToday;

    return Math.min(remainingRequests, remainingTokens);
  }

  async generateCompletion(prompt: string, options?: CompletionOptions): Promise<string> {
    try {
      if (!this.client) {
        await this.initialize();
      }

      // Combine system prompt and user prompt
      let fullPrompt = prompt;
      if (options?.systemPrompt) {
        fullPrompt = `${options.systemPrompt}\n\n${prompt}`;
      }

      const model = this.config.modelName || 'mistralai/Mistral-7B-Instruct-v0.1';
      
      const response = await this.client.textGeneration({
        model,
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: options?.maxTokens || 1000,
          temperature: options?.temperature || 0.7,
          return_full_text: false,
        },
      });

      return response.generated_text;
    } catch (error: any) {
      console.error('Hugging Face completion error:', error);
      throw new Error(`Hugging Face API error: ${error.message}`);
    }
  }
}
