# Design Document

## Overview

The AI Fitness Analysis system enhances the existing fitness coach functionality by integrating real AI/ML capabilities through free-tier external APIs. The system will analyze user workout data, nutrition logs, progress metrics, and provide intelligent, personalized recommendations using Large Language Models (LLMs) from providers like OpenAI, Google Gemini, or Hugging Face.

The design focuses on cost-effectiveness by leveraging free-tier APIs, implementing aggressive caching, and using prompt engineering to maximize the quality of AI responses while minimizing API calls.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  Mobile/Web App │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      API Gateway / Backend          │
│  ┌──────────────────────────────┐  │
│  │   AI Service Controller      │  │
│  └──────────┬───────────────────┘  │
│             │                       │
│  ┌──────────▼───────────────────┐  │
│  │   AI Service Layer           │  │
│  │  - Prompt Builder            │  │
│  │  - Response Parser           │  │
│  │  - Context Manager           │  │
│  └──────────┬───────────────────┘  │
│             │                       │
│  ┌──────────▼───────────────────┐  │
│  │   AI Provider Manager        │  │
│  │  - Provider Selection        │  │
│  │  - Rate Limit Tracking       │  │
│  │  - Fallback Logic            │  │
│  └──────────┬───────────────────┘  │
└─────────────┼───────────────────────┘
              │
     ┌────────┴────────┐
     │                 │
┌────▼─────┐    ┌─────▼──────┐
│  Cache   │    │  Database  │
│  (Redis) │    │ (MongoDB)  │
└──────────┘    └────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
    ┌────▼───┐  ┌────▼───┐  ┌────▼───┐
    │OpenAI  │  │Gemini  │  │Hugging │
    │  API   │  │  API   │  │  Face  │
    └────────┘  └────────┘  └────────┘
```

### Component Responsibilities

1. **AI Service Controller**: Handles HTTP requests for AI features, validates input, manages authentication
2. **AI Service Layer**: Core business logic for AI interactions, builds prompts, parses responses
3. **AI Provider Manager**: Manages multiple AI providers, handles rate limiting, implements fallback strategies
4. **Cache Layer**: Stores AI responses to reduce API calls and improve response times
5. **Database**: Stores user fitness data, AI interaction history, and analytics

## Components and Interfaces

### 1. AI Service Controller

**Endpoints:**

```typescript
// Get AI-powered workout analysis
GET /api/v1/ai/analyze/workout
Headers: Authorization: Bearer <token>
Response: {
  insights: string[],
  recommendations: string[],
  nextSteps: string[]
}

// Get AI-powered nutrition analysis
GET /api/v1/ai/analyze/nutrition
Headers: Authorization: Bearer <token>
Response: {
  insights: string[],
  recommendations: string[],
  mealSuggestions: string[]
}

// Get AI-powered progress analysis
GET /api/v1/ai/analyze/progress
Headers: Authorization: Bearer <token>
Response: {
  trends: string[],
  achievements: string[],
  suggestions: string[]
}

// Chat with AI fitness coach
POST /api/v1/ai/chat
Headers: Authorization: Bearer <token>
Body: {
  message: string,
  context?: string
}
Response: {
  response: string,
  suggestions?: string[]
}

// Generate adaptive workout plan
POST /api/v1/ai/workout-plan/generate
Headers: Authorization: Bearer <token>
Body: {
  duration: number, // weeks
  focusAreas?: string[]
}
Response: {
  plan: WorkoutPlan,
  rationale: string
}

// Get wellness suggestions
GET /api/v1/ai/wellness/suggestions
Headers: Authorization: Bearer <token>
Response: {
  sleep: string[],
  recovery: string[],
  stress: string[]
}

// Gym analytics (for gym owners)
GET /api/v1/ai/gym/{gymId}/insights
Headers: Authorization: Bearer <token>
Response: {
  usagePatterns: string[],
  recommendations: string[],
  predictions: string[]
}
```

### 2. AI Provider Manager

**Interface:**

```typescript
interface AIProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  getRemainingQuota(): Promise<number>;
  generateCompletion(prompt: string, options?: CompletionOptions): Promise<string>;
}

interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

class AIProviderManager {
  private providers: AIProvider[];
  private currentProvider: AIProvider;
  
  async selectProvider(): Promise<AIProvider>;
  async executeWithFallback(prompt: string, options?: CompletionOptions): Promise<string>;
  trackUsage(provider: string, tokens: number): void;
}
```

### 3. Prompt Builder

**Interface:**

```typescript
interface UserContext {
  fitnessProfile: FitnessProfile;
  recentWorkouts: Workout[];
  nutritionLogs: NutritionLog[];
  progressMetrics: ProgressMetric[];
  goals: string[];
}

class PromptBuilder {
  buildWorkoutAnalysisPrompt(context: UserContext): string;
  buildNutritionAnalysisPrompt(context: UserContext): string;
  buildProgressAnalysisPrompt(context: UserContext): string;
  buildChatPrompt(message: string, context: UserContext): string;
  buildWorkoutPlanPrompt(context: UserContext, duration: number): string;
  buildWellnessPrompt(context: UserContext): string;
  buildGymInsightsPrompt(gymData: GymAnalyticsData): string;
}
```

### 4. Cache Manager

**Interface:**

```typescript
interface CacheManager {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl: number): Promise<void>;
  generateKey(userId: string, analysisType: string, dataHash: string): string;
}
```

## Data Models

### FitnessProfile (MongoDB)

```typescript
interface FitnessProfile {
  userId: string;
  goals: string[]; // e.g., ["weight_loss", "muscle_gain"]
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  height: number; // cm
  weight: number; // kg
  age: number;
  gender: "male" | "female" | "other";
  dietaryPreferences: string[]; // e.g., ["vegetarian", "gluten_free"]
  medicalConditions?: string[];
  availableEquipment?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Workout (MongoDB)

```typescript
interface Workout {
  userId: string;
  date: Date;
  exercises: Exercise[];
  duration: number; // minutes
  intensity: "low" | "medium" | "high";
  notes?: string;
  completed: boolean;
  createdAt: Date;
}

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number; // kg
  duration?: number; // seconds
  completed: boolean;
}
```

### NutritionLog (MongoDB)

```typescript
interface NutritionLog {
  userId: string;
  date: Date;
  meals: Meal[];
  totalCalories: number;
  macros: {
    protein: number; // grams
    carbs: number;
    fats: number;
  };
  waterIntake: number; // ml
  createdAt: Date;
}

interface Meal {
  type: "breakfast" | "lunch" | "dinner" | "snack";
  items: string[];
  calories: number;
  time: Date;
}
```

### ProgressMetric (MongoDB)

```typescript
interface ProgressMetric {
  userId: string;
  date: Date;
  weight: number;
  bodyFat?: number; // percentage
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  photos?: string[]; // URLs
  notes?: string;
  createdAt: Date;
}
```

### AIInteraction (MongoDB)

```typescript
interface AIInteraction {
  userId: string;
  type: "workout_analysis" | "nutrition_analysis" | "progress_analysis" | "chat" | "workout_plan" | "wellness" | "gym_insights";
  prompt: string;
  response: string;
  provider: string; // "openai", "gemini", "huggingface"
  tokensUsed: number;
  cached: boolean;
  timestamp: Date;
}
```

### AIProviderConfig (MongoDB)

```typescript
interface AIProviderConfig {
  name: string;
  apiKey: string;
  endpoint: string;
  model: string;
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
  priority: number; // Lower number = higher priority
}
```

### GymAnalyticsData (Aggregated)

```typescript
interface GymAnalyticsData {
  gymId: string;
  period: {
    start: Date;
    end: Date;
  };
  bookings: {
    total: number;
    byHour: Record<number, number>;
    byDay: Record<string, number>;
  };
  revenue: {
    total: number;
    average: number;
  };
  members: {
    total: number;
    active: number;
    retention: number;
  };
  capacity: {
    average: number;
    peak: number;
    peakHours: number[];
  };
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Workout Analysis Generation
*For any* user with 3 or more completed workouts, requesting workout analysis should return insights containing consistency patterns, intensity trends, and exercise variety metrics.
**Validates: Requirements 1.1, 1.2**

### Property 2: Workout Recommendations Always Provided
*For any* completed workout analysis, the response should contain a non-empty array of specific recommendations.
**Validates: Requirements 1.3**

### Property 3: Personalized Exercise Plans
*For any* two users with different workout histories, the generated exercise plans should differ in at least one exercise or intensity level.
**Validates: Requirements 1.4**

### Property 4: Context-Aware Recommendations
*For any* user, recommendations should only include exercises requiring equipment that the user has marked as available in their profile.
**Validates: Requirements 1.5**

### Property 5: Nutrition Analysis Trigger
*For any* user with 7 or more days of meal logs, requesting nutrition analysis should return calculated macro distribution, calorie consistency, and nutrient gap metrics.
**Validates: Requirements 2.1, 2.2**

### Property 6: Goal-Aligned Meal Suggestions
*For any* two users with different fitness goals (e.g., weight loss vs muscle gain), the meal suggestions should differ in calorie targets and macro ratios.
**Validates: Requirements 2.3**

### Property 7: Dietary Restriction Compliance
*For any* user with dietary restrictions (vegetarian, vegan, gluten-free, etc.), all meal recommendations should exclude restricted food items.
**Validates: Requirements 2.4**

### Property 8: Meal Plan Variety
*For any* generated weekly meal plan, no meal should be repeated more than twice, and daily macro targets should be within 10% of the user's goals.
**Validates: Requirements 2.5**

### Property 9: Progress Trend Analysis
*For any* user with 14 or more days of body metrics, progress analysis should categorize trends as positive, plateau, or negative with supporting data.
**Validates: Requirements 3.1, 3.2**

### Property 10: Actionable Progress Insights
*For any* progress analysis, insights should contain specific, measurable recommendations (not vague statements like "keep going").
**Validates: Requirements 3.3**

### Property 11: Plateau Detection and Response
*For any* user whose weight has changed less than 0.5kg over 14 days while actively working out, the analysis should identify a plateau and provide specific change suggestions.
**Validates: Requirements 3.4**

### Property 12: Goal Achievement Next Steps
*For any* user who has achieved their primary goal (e.g., target weight reached), the analysis should provide next-step recommendations for continued progress.
**Validates: Requirements 3.5**

### Property 13: Contextually Relevant Chat Responses
*For any* fitness-related question, the AI response should contain at least one keyword or concept from the question or directly related fitness terms.
**Validates: Requirements 4.1**

### Property 14: Personalized Chat Context
*For any* chat response, when the user has logged data (workouts, meals, metrics), the response should reference at least one user-specific data point.
**Validates: Requirements 4.2**

### Property 15: Exercise Safety Information
*For any* chat question about a specific exercise, the response should include form instructions or safety tips (keywords: "form", "safety", "avoid", "proper", "technique").
**Validates: Requirements 4.4**

### Property 16: Medical Advice Disclaimer
*For any* chat question containing medical keywords (injury, pain, medication, condition), the response should include a recommendation to consult healthcare professionals.
**Validates: Requirements 4.5**

### Property 17: Difficulty Progression
*For any* user who completes 3 consecutive workouts at the same difficulty level, the next generated workout should increase in intensity (more sets, reps, or weight).
**Validates: Requirements 5.1, 5.2**

### Property 18: Exercise Modification Suggestions
*For any* workout where a user marks exercises as "too difficult" or skips them, the next workout plan should include modifications or alternatives for those exercises.
**Validates: Requirements 5.3**

### Property 19: Balanced Workout Plans
*For any* generated weekly workout plan, each major muscle group should be targeted at least once, and rest days should be included (at least 1 per week).
**Validates: Requirements 5.4**

### Property 20: Goal-Adaptive Plans
*For any* user who changes their fitness goal, the newly generated workout plan should differ from the previous plan in focus areas and intensity.
**Validates: Requirements 5.5**

### Property 21: Holistic Wellness Analysis
*For any* wellness analysis request, the response should include suggestions related to sleep, recovery, and stress management.
**Validates: Requirements 6.1, 6.3**

### Property 22: Overtraining Detection
*For any* user with 7+ consecutive days of high-intensity workouts without rest, the wellness analysis should recommend rest and recovery.
**Validates: Requirements 6.2**

### Property 23: Sleep Impact Education
*For any* user with inconsistent sleep patterns (variance > 2 hours), the wellness analysis should explain the impact on fitness goals.
**Validates: Requirements 6.4**

### Property 24: Gym Usage Pattern Analysis
*For any* gym with 30+ days of booking data, the analysis should identify peak hours, capacity trends, and provide specific time ranges.
**Validates: Requirements 7.1, 7.2**

### Property 25: Class Scheduling Recommendations
*For any* gym analysis, recommendations should include specific class scheduling suggestions based on identified peak hours.
**Validates: Requirements 7.3**

### Property 26: Retention Strategy Suggestions
*For any* gym with member retention rate below 70%, the analysis should provide specific engagement strategies.
**Validates: Requirements 7.4**

### Property 27: Actionable Business Insights
*For any* gym report, insights should contain action verbs (implement, schedule, offer, adjust) and measurable metrics.
**Validates: Requirements 7.5**

### Property 28: Free-Tier Provider Usage
*For any* AI request, the system should only use API endpoints and keys configured for free-tier services.
**Validates: Requirements 8.1**

### Property 29: Rate Limit Handling
*For any* provider approaching rate limits (>80% of limit), subsequent requests should be queued or routed to an alternative provider.
**Validates: Requirements 8.2**

### Property 30: Error Logging Completeness
*For any* error in AI processing, the log should contain timestamp, user ID, request type, provider used, and error message.
**Validates: Requirements 8.3**

### Property 31: Cache Hit Optimization
*For any* identical AI request made within 24 hours, the second request should return cached results without calling the external API.
**Validates: Requirements 8.4**

### Property 32: Provider Load Distribution
*For any* set of 100 requests, when multiple providers are available, requests should be distributed such that no single provider exceeds 60% of total requests.
**Validates: Requirements 8.5**

## Error Handling

### AI Provider Errors

1. **API Unavailable**: If primary provider is down, automatically fallback to secondary provider
2. **Rate Limit Exceeded**: Queue requests and retry after cooldown period, or route to alternative provider
3. **Invalid Response**: Log error, return cached response if available, or return generic fallback message
4. **Timeout**: Retry once with shorter timeout, then fallback to cached or generic response

### Data Validation Errors

1. **Insufficient Data**: Return clear message indicating minimum data requirements (e.g., "Need at least 3 workouts for analysis")
2. **Invalid Input**: Validate all user inputs and return specific error messages
3. **Missing Context**: Handle cases where user profile is incomplete gracefully

### Cache Errors

1. **Cache Miss**: Proceed with API call as normal
2. **Cache Corruption**: Clear corrupted entry and regenerate
3. **Redis Unavailable**: Continue without caching, log warning

### Prompt Building Errors

1. **Missing Required Fields**: Use default values or skip optional sections
2. **Token Limit Exceeded**: Truncate context intelligently (keep most recent data)

## Testing Strategy

### Unit Testing

- Test prompt building functions with various user contexts
- Test response parsing for different AI provider formats
- Test cache key generation and retrieval
- Test rate limit tracking logic
- Test provider selection algorithm
- Test error handling for each error type

### Property-Based Testing

We will use **fast-check** (for TypeScript/Node.js) as our property-based testing library. Each property test will run a minimum of 100 iterations.

**Property Test Examples:**

1. **Dietary Restriction Compliance (Property 7)**
   - Generate random users with various dietary restrictions
   - Generate meal recommendations for each
   - Verify no restricted items appear in recommendations
   - Tag: **Feature: ai-fitness-analysis, Property 7: Dietary Restriction Compliance**

2. **Cache Hit Optimization (Property 31)**
   - Generate random AI requests
   - Make same request twice within 24 hours
   - Verify second request doesn't call external API
   - Tag: **Feature: ai-fitness-analysis, Property 31: Cache Hit Optimization**

3. **Balanced Workout Plans (Property 19)**
   - Generate random user profiles
   - Generate weekly workout plans
   - Verify each muscle group appears at least once
   - Verify at least one rest day exists
   - Tag: **Feature: ai-fitness-analysis, Property 19: Balanced Workout Plans**

### Integration Testing

- Test end-to-end flow from API request to AI response
- Test provider fallback scenarios
- Test caching across multiple requests
- Test rate limiting with high request volumes

### Manual Testing

- Test AI response quality with real user data
- Verify tone and helpfulness of responses
- Test edge cases with unusual user profiles
- Verify medical disclaimers appear appropriately

## Implementation Considerations

### Prompt Engineering

Effective prompts are crucial for quality AI responses. Each prompt should:

1. **Provide Clear Context**: Include user's fitness level, goals, and relevant history
2. **Specify Output Format**: Request structured responses (JSON when possible)
3. **Set Constraints**: Explicitly state dietary restrictions, equipment limitations
4. **Include Examples**: Show the AI what good responses look like
5. **Set Tone**: Request supportive, motivational, and educational tone

**Example Prompt Template:**

```
You are a professional fitness coach analyzing data for a user.

User Profile:
- Fitness Level: {fitnessLevel}
- Goals: {goals}
- Dietary Restrictions: {restrictions}
- Available Equipment: {equipment}

Recent Activity:
{workoutSummary}

Task: Analyze the user's workout patterns and provide:
1. Three specific insights about their consistency and progress
2. Three actionable recommendations for improvement
3. Suggested next steps

Format your response as JSON with keys: insights, recommendations, nextSteps
Be supportive, specific, and educational in your advice.
```

### Cost Optimization Strategies

1. **Aggressive Caching**: Cache responses for 24 hours, use content-based cache keys
2. **Request Batching**: Combine multiple analyses into single API call when possible
3. **Token Optimization**: Minimize prompt size while maintaining quality
4. **Provider Rotation**: Distribute load across multiple free-tier providers
5. **Lazy Loading**: Only generate AI insights when explicitly requested by user
6. **Fallback to Templates**: Use template-based responses for common scenarios

### Provider Configuration

**OpenAI (GPT-3.5-turbo)**
- Free tier: Limited requests per day
- Best for: Conversational chat, general advice
- Fallback priority: 1

**Google Gemini**
- Free tier: Generous limits
- Best for: Analysis, structured data processing
- Fallback priority: 2

**Hugging Face (Open Models)**
- Free tier: API rate limits
- Best for: Specific tasks, classification
- Fallback priority: 3

### Security Considerations

1. **API Key Management**: Store keys in environment variables, never in code
2. **User Data Privacy**: Anonymize user data in prompts when possible
3. **Input Sanitization**: Validate and sanitize all user inputs before sending to AI
4. **Rate Limiting**: Implement per-user rate limits to prevent abuse
5. **Audit Logging**: Log all AI interactions for compliance and debugging

### Performance Targets

- **Response Time**: < 3 seconds for cached responses, < 5 seconds for new AI requests
- **Cache Hit Rate**: > 40% for common analysis requests
- **API Success Rate**: > 95% (including fallbacks)
- **Cost**: < $0.01 per user per month (leveraging free tiers)

## Future Enhancements

1. **Fine-tuned Models**: Train custom models on fitness data for better accuracy
2. **Real-time Coaching**: Provide live workout guidance during gym sessions
3. **Voice Integration**: Add voice-based AI coaching
4. **Computer Vision**: Analyze workout form from videos
5. **Predictive Analytics**: Predict user churn, goal achievement likelihood
6. **Multi-language Support**: Provide AI coaching in multiple languages
7. **Integration with Wearables**: Incorporate data from fitness trackers
8. **Social Features**: AI-powered workout buddy matching
