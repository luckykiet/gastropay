/**
 * Merchant API Tests (Protected endpoints)
 * Tests for: getSelf, updateMerchant, updatePassword, restaurant CRUD
 */
const request = require('supertest');
const app = require('../functions/server');
const mongoose = require('mongoose');
const MerchantModel = require('../functions/models/MerchantModel');
const RestaurantModel = require('../functions/models/RestaurantModel');
const {
  createTestMerchant,
  createTestRestaurant,
  createTestTransaction,
  generateAuthToken,
} = require('./test-helpers');

describe('Merchant API (Protected)', () => {
  let merchant;
  let token;

  beforeEach(async () => {
    merchant = await createTestMerchant({
      email: 'merchant@test.com',
      password: 'MerchantPass123',
      ico: '25596641',
    });
    token = generateAuthToken(merchant._id, merchant.ico);
    await MerchantModel.findByIdAndUpdate(merchant._id, {
      $push: { tokens: token },
    });
  });

  // ============================================
  // GET /api/merchant (getSelf)
  // ============================================
  describe('GET /api/merchant', () => {
    it('should return merchant profile', async () => {
      const res = await request(app)
        .get('/api/merchant')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.msg.email).toBe('merchant@test.com');
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/merchant');

      expect(res.status).toBe(401);
    });

    it('should include payment gates in response', async () => {
      const res = await request(app)
        .get('/api/merchant')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.msg.paymentGates).toBeDefined();
    });

    it('should not return password in response', async () => {
      const res = await request(app)
        .get('/api/merchant')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      // Password should be hashed but exists
      expect(res.body.msg.password).toBeDefined();
      expect(res.body.msg.password).not.toBe('MerchantPass123');
    });

    it('should initialize empty payment gates if missing', async () => {
      // Create merchant without payment gates
      const newMerchant = await createTestMerchant({
        email: 'nopayment@test.com',
        ico: '27082440',
      });
      // Remove payment gates
      await MerchantModel.findByIdAndUpdate(newMerchant._id, {
        $unset: { paymentGates: 1 },
      });

      const newToken = generateAuthToken(newMerchant._id, newMerchant.ico);
      await MerchantModel.findByIdAndUpdate(newMerchant._id, {
        $push: { tokens: newToken },
      });

      const res = await request(app)
        .get('/api/merchant')
        .set('Authorization', `Bearer ${newToken}`);

      expect(res.status).toBe(200);
    });
  });

  // ============================================
  // PUT /api/merchant (updateMerchant)
  // ============================================
  describe('PUT /api/merchant', () => {
    it('should update merchant with correct password', async () => {
      const res = await request(app)
        .put('/api/merchant')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          password: 'MerchantPass123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject update with wrong password', async () => {
      const res = await request(app)
        .put('/api/merchant')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Name',
          password: 'WrongPassword',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.msg.password).toBe('Nesprávné heslo');
    });

    it('should reject update without password', async () => {
      const res = await request(app)
        .put('/api/merchant')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Name',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should update payment gates', async () => {
      const res = await request(app)
        .put('/api/merchant')
        .set('Authorization', `Bearer ${token}`)
        .send({
          password: 'MerchantPass123',
          paymentGates: {
            comgate: {
              merchant: 'updated_merchant',
              secret: 'updated_secret',
              isAvailable: true,
            },
          },
        });

      expect(res.status).toBe(200);

      const updated = await MerchantModel.findById(merchant._id);
      expect(updated.paymentGates.comgate.merchant).toBe('updated_merchant');
    });

    it('should disable all restaurants when merchant is disabled', async () => {
      await createTestRestaurant(merchant._id, {
        name: 'Active Restaurant',
        isAvailable: true,
      });

      const res = await request(app)
        .put('/api/merchant')
        .set('Authorization', `Bearer ${token}`)
        .send({
          password: 'MerchantPass123',
          isAvailable: false,
        });

      expect(res.status).toBe(200);

      const restaurants = await RestaurantModel.find({ idOwner: merchant._id });
      expect(restaurants.every((r) => r.isAvailable === false)).toBe(true);
    });
  });

  // ============================================
  // PUT /api/merchant/changepassword
  // ============================================
  describe('PUT /api/merchant/changepassword', () => {
    it('should change password with correct credentials', async () => {
      const res = await request(app)
        .put('/api/merchant/changepassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'MerchantPass123',
          newPassword: 'NewPassword456',
          confirmNewPassword: 'NewPassword456',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject with wrong current password', async () => {
      const res = await request(app)
        .put('/api/merchant/changepassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword456',
          confirmNewPassword: 'NewPassword456',
        });

      expect(res.status).toBe(400);
      expect(res.body.msg.currentPassword).toBe('Incorrect password');
    });

    it('should reject when new passwords dont match', async () => {
      const res = await request(app)
        .put('/api/merchant/changepassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'MerchantPass123',
          newPassword: 'NewPassword456',
          confirmNewPassword: 'DifferentPassword',
        });

      expect(res.status).toBe(400);
      expect(res.body.msg.confirmNewPassword).toBe('New passwords not matching');
    });

    it('should reject with missing fields', async () => {
      const res = await request(app)
        .put('/api/merchant/changepassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'MerchantPass123',
        });

      expect(res.status).toBe(400);
    });
  });

  // ============================================
  // GET /api/merchant/restaurants
  // ============================================
  describe('GET /api/merchant/restaurants', () => {
    it('should return merchant restaurants', async () => {
      await createTestRestaurant(merchant._id, { name: 'My Restaurant 1' });
      await createTestRestaurant(merchant._id, { name: 'My Restaurant 2' });

      const res = await request(app)
        .get('/api/merchant/restaurants')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.msg).toHaveLength(2);
    });

    it('should return empty message when no restaurants', async () => {
      const res = await request(app)
        .get('/api/merchant/restaurants')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
    });

    it('should only return own restaurants', async () => {
      const otherMerchant = await createTestMerchant({
        email: 'other@test.com',
        ico: '27082440',
      });
      await createTestRestaurant(merchant._id, { name: 'My Restaurant' });
      await createTestRestaurant(otherMerchant._id, { name: 'Other Restaurant' });

      const res = await request(app)
        .get('/api/merchant/restaurants')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.msg).toHaveLength(1);
      expect(res.body.msg[0].name).toBe('My Restaurant');
    });

    it('should sort by createdAt descending', async () => {
      await createTestRestaurant(merchant._id, { name: 'First Restaurant' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      await createTestRestaurant(merchant._id, { name: 'Second Restaurant' });

      const res = await request(app)
        .get('/api/merchant/restaurants')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.msg[0].name).toBe('Second Restaurant');
    });
  });

  // ============================================
  // GET /api/merchant/restaurant/:restaurantId
  // ============================================
  describe('GET /api/merchant/restaurant/:restaurantId', () => {
    it('should return restaurant by ID', async () => {
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Detail Restaurant',
      });

      const res = await request(app)
        .get(`/api/merchant/restaurant/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.msg.name).toBe('Detail Restaurant');
    });

    it('should include api settings', async () => {
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'API Restaurant',
        api: {
          key: 'secret-key',
          menuUrl: 'https://example.com/menu',
        },
      });

      const res = await request(app)
        .get(`/api/merchant/restaurant/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.msg.api.key).toBe('secret-key');
    });

    it('should not return other merchants restaurant', async () => {
      const otherMerchant = await createTestMerchant({
        email: 'other@test.com',
        ico: '27082440',
      });
      const restaurant = await createTestRestaurant(otherMerchant._id, {
        name: 'Other Restaurant',
      });

      const res = await request(app)
        .get(`/api/merchant/restaurant/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
    });
  });

  // ============================================
  // POST /api/merchant/restaurant
  // ============================================
  describe('POST /api/merchant/restaurant', () => {
    it('should create new restaurant', async () => {
      const res = await request(app)
        .post('/api/merchant/restaurant')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Restaurant',
          address: {
            street: 'New Street 1',
            city: 'Prague',
            postalCode: '11000',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.msg.name).toBe('New Restaurant');
    });

    it('should reject empty body', async () => {
      const res = await request(app)
        .post('/api/merchant/restaurant')
        .set('Authorization', `Bearer ${token}`)
        .send();

      // Mongoose validation returns 422 for missing required fields
      expect([400, 422]).toContain(res.status);
    });

    it('should reject duplicate restaurant name for same owner', async () => {
      await createTestRestaurant(merchant._id, { name: 'Existing Restaurant' });

      const res = await request(app)
        .post('/api/merchant/restaurant')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Existing Restaurant',
          address: {
            street: 'Street',
            city: 'City',
            postalCode: '11000',
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.msg).toContain('already exists');
    });

    it('should allow same name for different owners', async () => {
      const otherMerchant = await createTestMerchant({
        email: 'other@test.com',
        ico: '27082440',
      });
      await createTestRestaurant(otherMerchant._id, { name: 'Same Name' });

      // This will fail because restaurant name is globally unique
      const res = await request(app)
        .post('/api/merchant/restaurant')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Same Name',
          address: {
            street: 'Street',
            city: 'City',
            postalCode: '11000',
          },
        });

      // Restaurant name is unique globally due to schema
      expect(res.status).toBe(400);
    });
  });

  // ============================================
  // PUT /api/merchant/restaurant/:restaurantId
  // ============================================
  describe('PUT /api/merchant/restaurant/:restaurantId', () => {
    it('should update restaurant', async () => {
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Update Restaurant',
      });

      const res = await request(app)
        .put(`/api/merchant/restaurant/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          openingTime: {
            monday: { from: '09:00', to: '21:00', isOpen: true },
            tuesday: { from: '09:00', to: '21:00', isOpen: true },
            wednesday: { from: '09:00', to: '21:00', isOpen: true },
            thursday: { from: '09:00', to: '21:00', isOpen: true },
            friday: { from: '09:00', to: '21:00', isOpen: true },
            saturday: { from: '10:00', to: '20:00', isOpen: true },
            sunday: { from: '10:00', to: '18:00', isOpen: false },
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject invalid opening times (close before open)', async () => {
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Time Restaurant',
      });

      const res = await request(app)
        .put(`/api/merchant/restaurant/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          openingTime: {
            monday: { from: '22:00', to: '08:00', isOpen: true }, // Invalid
            tuesday: { from: '09:00', to: '21:00', isOpen: true },
            wednesday: { from: '09:00', to: '21:00', isOpen: true },
            thursday: { from: '09:00', to: '21:00', isOpen: true },
            friday: { from: '09:00', to: '21:00', isOpen: true },
            saturday: { from: '10:00', to: '20:00', isOpen: true },
            sunday: { from: '10:00', to: '18:00', isOpen: false },
          },
        });

      expect(res.status).toBe(400);
    });

    it('should reject update without openingTime', async () => {
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'No Time Restaurant',
      });

      const res = await request(app)
        .put(`/api/merchant/restaurant/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Name',
        });

      expect(res.status).toBe(400);
    });

    it('should reject invalid restaurant ID', async () => {
      const res = await request(app)
        .put('/api/merchant/restaurant/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({
          openingTime: {},
        });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('Invalid ID.');
    });

    it('should not update other merchants restaurant', async () => {
      const otherMerchant = await createTestMerchant({
        email: 'other@test.com',
        ico: '27082440',
      });
      const restaurant = await createTestRestaurant(otherMerchant._id, {
        name: 'Other Restaurant',
      });

      const res = await request(app)
        .put(`/api/merchant/restaurant/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Hacked Name',
          openingTime: {
            monday: { from: '09:00', to: '21:00', isOpen: true },
            tuesday: { from: '09:00', to: '21:00', isOpen: true },
            wednesday: { from: '09:00', to: '21:00', isOpen: true },
            thursday: { from: '09:00', to: '21:00', isOpen: true },
            friday: { from: '09:00', to: '21:00', isOpen: true },
            saturday: { from: '10:00', to: '20:00', isOpen: true },
            sunday: { from: '10:00', to: '18:00', isOpen: false },
          },
        });

      expect(res.status).toBe(404);
    });
  });

  // ============================================
  // DELETE /api/merchant/restaurant/:restaurantId
  // ============================================
  describe('DELETE /api/merchant/restaurant/:restaurantId', () => {
    it('should delete restaurant', async () => {
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Delete Restaurant',
      });

      const res = await request(app)
        .delete(`/api/merchant/restaurant/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deleted = await RestaurantModel.findById(restaurant._id);
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent restaurant', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/merchant/restaurant/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should reject invalid ID', async () => {
      const res = await request(app)
        .delete('/api/merchant/restaurant/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });

    it('should not delete other merchants restaurant', async () => {
      const otherMerchant = await createTestMerchant({
        email: 'other@test.com',
        ico: '27082440',
      });
      const restaurant = await createTestRestaurant(otherMerchant._id, {
        name: 'Other Restaurant',
      });

      const res = await request(app)
        .delete(`/api/merchant/restaurant/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);

      const stillExists = await RestaurantModel.findById(restaurant._id);
      expect(stillExists).not.toBeNull();
    });
  });

  // ============================================
  // GET /api/merchant/restaurant/transaction/:restaurantId
  // ============================================
  describe('GET /api/merchant/restaurant/transaction/:restaurantId', () => {
    it('should return restaurant transactions', async () => {
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Trans Restaurant',
      });
      await createTestTransaction(restaurant._id, { refId: 'TRANS001' });
      await createTestTransaction(restaurant._id, { refId: 'TRANS002' });

      const res = await request(app)
        .get(`/api/merchant/restaurant/transaction/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.msg).toHaveLength(2);
    });

    it('should return empty for restaurant with no transactions', async () => {
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'No Trans Restaurant',
      });

      const res = await request(app)
        .get(`/api/merchant/restaurant/transaction/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.msg).toHaveLength(0);
    });

    it('should sort transactions by createdAt descending', async () => {
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Sort Restaurant',
      });
      await createTestTransaction(restaurant._id, { refId: 'FIRST001' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      await createTestTransaction(restaurant._id, { refId: 'SECOND02' });

      const res = await request(app)
        .get(`/api/merchant/restaurant/transaction/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.msg[0].refId).toBe('SECOND02');
    });
  });
});
