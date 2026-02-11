/**
 * Authentication API Tests
 * Tests for: login, logout, register, check, password reset
 */
const request = require('supertest');
const app = require('../functions/server');
const MerchantModel = require('../functions/models/MerchantModel');
const {
  createTestMerchant,
  generateAuthToken,
} = require('./test-helpers');

describe('Auth API', () => {
  // ============================================
  // POST /api/auth/login
  // ============================================
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await createTestMerchant({
        email: 'login@test.com',
        password: 'ValidPass123',
        ico: '25596641',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'ValidPass123' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.msg.token).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'AnyPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.msg).toBe('Nesprávná kombinace');
    });

    it('should reject invalid password', async () => {
      await createTestMerchant({
        email: 'wrongpass@test.com',
        password: 'CorrectPass123',
        ico: '27082440',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrongpass@test.com', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.msg).toBe('Nesprávná kombinace');
    });

    it('should reject empty credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should store token in merchant tokens array', async () => {
      const merchant = await createTestMerchant({
        email: 'tokenstore@test.com',
        password: 'StoreToken123',
        ico: '45274649',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'tokenstore@test.com', password: 'StoreToken123' });

      expect(res.status).toBe(201);

      const updatedMerchant = await MerchantModel.findById(merchant._id);
      expect(updatedMerchant.tokens).toContain(res.body.msg.token);
    });
  });

  // ============================================
  // POST /api/auth/logout
  // ============================================
  describe('POST /api/auth/logout', () => {
    it('should logout and remove token', async () => {
      const merchant = await createTestMerchant({
        email: 'logout@test.com',
        password: 'Logout123',
        ico: '25596641',
      });

      // Login first
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'logout@test.com', password: 'Logout123' });

      const token = loginRes.body.msg.token;

      // Logout
      const res = await request(app)
        .post('/api/auth/logout')
        .send({ token });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify token removed
      const updatedMerchant = await MerchantModel.findById(merchant._id);
      expect(updatedMerchant.tokens).not.toContain(token);
    });

    it('should handle logout with invalid token gracefully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .send({ token: 'invalid-token-123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should handle logout without token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ============================================
  // POST /api/auth/register
  // ============================================
  describe('POST /api/auth/register', () => {
    it('should register new merchant', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newmerchant@test.com',
          password: 'NewPass123',
          ico: '25596641',
          name: 'New Merchant',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.msg.token).toBeDefined();
    });

    it('should reject duplicate ICO', async () => {
      await createTestMerchant({
        email: 'first@test.com',
        ico: '25596641',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'second@test.com',
          password: 'Pass123',
          ico: '25596641',
          name: 'Second Merchant',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.msg).toContain('already exists');
    });

    it('should reject duplicate email', async () => {
      await createTestMerchant({
        email: 'duplicate@test.com',
        ico: '25596641',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'Pass123',
          ico: '27082440',
          name: 'Another Merchant',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.msg).toContain('already exists');
    });

    it('should reject empty body', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send();

      // Returns 400 when body is null/undefined (controller check)
      expect([400, 422]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Pass123',
          ico: '25596641',
        });

      // Mongoose validation returns 422
      expect([400, 422]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid ICO format (not 8 digits)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'valid@test.com',
          password: 'Pass123',
          ico: '1234567', // Only 7 digits
        });

      // Mongoose validation returns 422
      expect([400, 422]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          // Missing password and ico
        });

      // Mongoose validation returns 422
      expect([400, 422]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('should auto-login after registration (return token)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'autologin@test.com',
          password: 'AutoLogin123',
          ico: '45274649',
        });

      expect(res.status).toBe(201);
      expect(res.body.msg.token).toBeDefined();
      expect(Array.isArray(res.body.msg.token)).toBe(true);
      expect(res.body.msg.token.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // GET /api/auth/check
  // ============================================
  describe('GET /api/auth/check', () => {
    it('should return true for existing ICO', async () => {
      await createTestMerchant({ ico: '25596641' });

      const res = await request(app)
        .get('/api/auth/check')
        .query({ ico: '25596641' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.msg).toBe(true);
    });

    it('should return false for non-existing ICO', async () => {
      const res = await request(app)
        .get('/api/auth/check')
        .query({ ico: '99999999' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.msg).toBe(false);
    });

    it('should return true for existing email', async () => {
      await createTestMerchant({ email: 'exists@test.com', ico: '25596641' });

      const res = await request(app)
        .get('/api/auth/check')
        .query({ email: 'exists@test.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.msg).toBe(true);
    });

    it('should return false for non-existing email', async () => {
      const res = await request(app)
        .get('/api/auth/check')
        .query({ email: 'notexists@test.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.msg).toBe(false);
    });

    it('should reject request without query params', async () => {
      const res = await request(app)
        .get('/api/auth/check');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ============================================
  // GET /api/protected (auth middleware test)
  // ============================================
  describe('GET /api/protected', () => {
    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/protected');

      expect(res.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });

    it('should accept request with valid token', async () => {
      const merchant = await createTestMerchant({
        email: 'protected@test.com',
        ico: '25596641',
      });
      const token = generateAuthToken(merchant._id, merchant.ico);

      // Add token to merchant
      await MerchantModel.findByIdAndUpdate(merchant._id, {
        $push: { tokens: token }
      });

      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.msg.userId).toBe(merchant._id.toString());
    });

    it('should reject expired token', async () => {
      const merchant = await createTestMerchant({
        email: 'expired@test.com',
        ico: '27082440',
      });

      const jwt = require('jsonwebtoken');
      const config = require('../functions/config/config');
      const expiredToken = jwt.sign(
        { userId: merchant._id.toString(), ico: merchant.ico },
        config.JWT_SECRET,
        { expiresIn: '-1h' } // Already expired
      );

      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
    });

    it('should reject token not in merchant tokens array', async () => {
      const merchant = await createTestMerchant({
        email: 'notinarray@test.com',
        ico: '45274649',
      });

      // Generate token but don't add to merchant
      const token = generateAuthToken(merchant._id, merchant.ico);

      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
    });
  });
});
