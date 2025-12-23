/**
 * Restaurant API Tests (Public endpoints)
 * Tests for: getRestaurants, getRestaurantById, searchRestaurants
 */
const request = require('supertest');
const app = require('../functions/server');
const mongoose = require('mongoose');
const {
  createTestMerchant,
  createTestRestaurant,
} = require('./test-helpers');

describe('Restaurant API (Public)', () => {
  // ============================================
  // GET /api/restaurants
  // ============================================
  describe('GET /api/restaurants', () => {
    it('should return all available restaurants', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      await createTestRestaurant(merchant._id, { name: 'Restaurant 1', isAvailable: true });
      await createTestRestaurant(merchant._id, { name: 'Restaurant 2', isAvailable: true });

      const res = await request(app).get('/api/restaurants');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.msg).toHaveLength(2);
    });

    it('should not return unavailable restaurants', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      await createTestRestaurant(merchant._id, { name: 'Available', isAvailable: true });
      await createTestRestaurant(merchant._id, { name: 'Unavailable', isAvailable: false });

      const res = await request(app).get('/api/restaurants');

      expect(res.status).toBe(200);
      expect(res.body.msg).toHaveLength(1);
      expect(res.body.msg[0].name).toBe('Available');
    });

    it('should return 404 when no restaurants available', async () => {
      const res = await request(app).get('/api/restaurants');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should sort restaurants by name ascending', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      await createTestRestaurant(merchant._id, { name: 'Zesty Bistro', isAvailable: true });
      await createTestRestaurant(merchant._id, { name: 'Alpha Cafe', isAvailable: true });

      const res = await request(app)
        .get('/api/restaurants')
        .query({ field: 'name', orderBy: 'asc' });

      expect(res.status).toBe(200);
      expect(res.body.msg[0].name).toBe('Alpha Cafe');
      expect(res.body.msg[1].name).toBe('Zesty Bistro');
    });

    it('should sort restaurants by name descending', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      await createTestRestaurant(merchant._id, { name: 'Alpha Cafe', isAvailable: true });
      await createTestRestaurant(merchant._id, { name: 'Zesty Bistro', isAvailable: true });

      const res = await request(app)
        .get('/api/restaurants')
        .query({ field: 'name', orderBy: 'desc' });

      expect(res.status).toBe(200);
      expect(res.body.msg[0].name).toBe('Zesty Bistro');
    });

    it('should sort by address.city', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      await createTestRestaurant(merchant._id, {
        name: 'Prague Restaurant',
        address: { street: 'St 1', city: 'Prague', postalCode: '11000' },
        isAvailable: true,
      });
      await createTestRestaurant(merchant._id, {
        name: 'Brno Restaurant',
        address: { street: 'St 2', city: 'Brno', postalCode: '60200' },
        isAvailable: true,
      });

      const res = await request(app)
        .get('/api/restaurants')
        .query({ field: 'address.city', orderBy: 'asc' });

      expect(res.status).toBe(200);
      expect(res.body.msg[0].address.city).toBe('Brno');
    });

    it('should include opening time info', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      await createTestRestaurant(merchant._id, { name: 'With Hours', isAvailable: true });

      const res = await request(app).get('/api/restaurants');

      expect(res.status).toBe(200);
      expect(res.body.msg[0].openingTime).toBeDefined();
      expect(res.body.msg[0].openingTime.today).toBeDefined();
    });

    it('should not return api keys in response', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      await createTestRestaurant(merchant._id, { name: 'Test', isAvailable: true });

      const res = await request(app).get('/api/restaurants');

      expect(res.status).toBe(200);
      expect(res.body.msg[0].api).toBeUndefined();
      expect(res.body.msg[0].key).toBeUndefined();
    });
  });

  // ============================================
  // GET /api/restaurant/:restaurantId
  // ============================================
  describe('GET /api/restaurant/:restaurantId', () => {
    it('should return restaurant by valid ID', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Specific Restaurant',
        isAvailable: true,
      });

      const res = await request(app).get(`/api/restaurant/${restaurant._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.msg.name).toBe('Specific Restaurant');
    });

    it('should return 404 for non-existent restaurant', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app).get(`/api/restaurant/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid ObjectId', async () => {
      const res = await request(app).get('/api/restaurant/invalid-id');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.msg).toBe('Invalid ID.');
    });

    it('should not return unavailable restaurant', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Hidden Restaurant',
        isAvailable: false,
      });

      const res = await request(app).get(`/api/restaurant/${restaurant._id}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should include api info for available restaurant', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'API Restaurant',
        isAvailable: true,
        api: {
          key: 'test-key',
          menuUrl: 'https://example.com/menu',
        },
      });

      const res = await request(app).get(`/api/restaurant/${restaurant._id}`);

      expect(res.status).toBe(200);
      expect(res.body.msg.api).toBeDefined();
    });

    it('should include full opening time schedule', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Schedule Restaurant',
        isAvailable: true,
      });

      const res = await request(app).get(`/api/restaurant/${restaurant._id}`);

      expect(res.status).toBe(200);
      expect(res.body.msg.openingTime.monday).toBeDefined();
      expect(res.body.msg.openingTime.tuesday).toBeDefined();
    });
  });

  // ============================================
  // GET /api/restaurants/search
  // ============================================
  describe('GET /api/restaurants/search', () => {
    beforeEach(async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      await createTestRestaurant(merchant._id, {
        name: 'Pizza Palace',
        address: { street: 'Main Street', city: 'Prague', postalCode: '11000' },
        isAvailable: true,
      });
      await createTestRestaurant(merchant._id, {
        name: 'Sushi Heaven',
        address: { street: 'Second Avenue', city: 'Brno', postalCode: '60200' },
        isAvailable: true,
      });
      await createTestRestaurant(merchant._id, {
        name: 'Burger Joint',
        address: { street: 'Third Road', city: 'Prague', postalCode: '12000' },
        isAvailable: true,
      });
    });

    it('should search by restaurant name', async () => {
      const res = await request(app)
        .get('/api/restaurants/search')
        .query({ text: 'Pizza' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.msg).toHaveLength(1);
      expect(res.body.msg[0].name).toBe('Pizza Palace');
    });

    it('should search by city (case insensitive)', async () => {
      const res = await request(app)
        .get('/api/restaurants/search')
        .query({ text: 'prague' });

      expect(res.status).toBe(200);
      expect(res.body.msg).toHaveLength(2);
    });

    it('should search by street name', async () => {
      const res = await request(app)
        .get('/api/restaurants/search')
        .query({ text: 'Second Avenue' });

      expect(res.status).toBe(200);
      expect(res.body.msg).toHaveLength(1);
      expect(res.body.msg[0].name).toBe('Sushi Heaven');
    });

    it('should return empty for no matches', async () => {
      const res = await request(app)
        .get('/api/restaurants/search')
        .query({ text: 'NonexistentPlace' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
    });

    it('should support partial matching', async () => {
      const res = await request(app)
        .get('/api/restaurants/search')
        .query({ text: 'Burg' });

      expect(res.status).toBe(200);
      expect(res.body.msg).toHaveLength(1);
      expect(res.body.msg[0].name).toBe('Burger Joint');
    });

    it('should sort search results by name by default', async () => {
      const res = await request(app)
        .get('/api/restaurants/search')
        .query({ text: 'Prague' });

      expect(res.status).toBe(200);
      // Default sort is 'name': 'asc'
      expect(res.body.msg[0].name).toBe('Burger Joint');
      expect(res.body.msg[1].name).toBe('Pizza Palace');
    });

    it('should allow custom sorting in search', async () => {
      const res = await request(app)
        .get('/api/restaurants/search')
        .query({ text: 'Prague', field: 'name', orderBy: 'desc' });

      expect(res.status).toBe(200);
      expect(res.body.msg[0].name).toBe('Pizza Palace');
    });

    it('should not return unavailable restaurants in search', async () => {
      const merchant = await createTestMerchant({ email: 'another@test.com', ico: '27082440' });
      await createTestRestaurant(merchant._id, {
        name: 'Hidden Pizza',
        address: { street: 'Hidden St', city: 'Prague', postalCode: '11000' },
        isAvailable: false,
      });

      const res = await request(app)
        .get('/api/restaurants/search')
        .query({ text: 'Hidden Pizza' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
    });
  });
});
