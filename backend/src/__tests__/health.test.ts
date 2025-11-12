import request from 'supertest';
import express from 'express';

// Create a simple test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Health endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'GYMFU API is running',
      timestamp: new Date().toISOString(),
    });
  });

  return app;
};

describe('Health Endpoints', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });

    it('should return success true', async () => {
      const response = await request(app).get('/health');
      expect(response.body.success).toBe(true);
    });

    it('should return correct message', async () => {
      const response = await request(app).get('/health');
      expect(response.body.message).toBe('GYMFU API is running');
    });

    it('should return timestamp', async () => {
      const response = await request(app).get('/health');
      expect(response.body.timestamp).toBeDefined();
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should return JSON content type', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});
