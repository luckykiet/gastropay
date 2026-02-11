/**
 * Transaction API Tests
 * Tests for: createTransaction, getPaymentMethods, getTransaction
 */
const request = require('supertest');
const app = require('../functions/server');
const mongoose = require('mongoose');
const TransactionModel = require('../functions/models/TransactionModel');
const {
  createTestMerchant,
  createTestRestaurant,
  createTestTransaction,
} = require('./test-helpers');

describe('Transaction API', () => {
  // ============================================
  // GET /api/transaction/paymentMethods/:idRestaurant
  // ============================================
  describe('GET /api/transaction/paymentMethods/:idRestaurant', () => {
    it('should return available payment methods', async () => {
      const merchant = await createTestMerchant({
        ico: '25596641',
        paymentGates: {
          comgate: {
            merchant: 'test',
            secret: 'test',
            isAvailable: true,
            test: true,
          },
          csob: {
            isAvailable: false,
          },
        },
      });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Payment Test',
        isAvailable: true,
      });

      const res = await request(app).get(
        `/api/transaction/paymentMethods/${restaurant._id}`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.msg).toHaveLength(1);
      expect(res.body.msg[0].paymentGate).toBe('comgate');
      expect(res.body.msg[0].test).toBe(true);
    });

    it('should return multiple payment methods if available', async () => {
      const merchant = await createTestMerchant({
        ico: '25596641',
        paymentGates: {
          comgate: {
            merchant: 'test',
            secret: 'test',
            isAvailable: true,
            test: false,
          },
          csob: {
            merchantId: 'test',
            privateKey: 'test',
            isAvailable: true,
            test: true,
          },
        },
      });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Multi Payment',
        isAvailable: true,
      });

      const res = await request(app).get(
        `/api/transaction/paymentMethods/${restaurant._id}`
      );

      expect(res.status).toBe(200);
      expect(res.body.msg).toHaveLength(2);
    });

    it('should return empty array if no payment methods available', async () => {
      const merchant = await createTestMerchant({
        ico: '25596641',
        paymentGates: {
          comgate: {
            merchant: 'test',
            isAvailable: false,
          },
          csob: {
            isAvailable: false,
          },
        },
      });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'No Payment',
        isAvailable: true,
      });

      const res = await request(app).get(
        `/api/transaction/paymentMethods/${restaurant._id}`
      );

      expect(res.status).toBe(200);
      expect(res.body.msg).toHaveLength(0);
    });

    it('should return 404 for non-existent restaurant', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app).get(
        `/api/transaction/paymentMethods/${fakeId}`
      );

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 if merchant not found', async () => {
      // Create restaurant with non-existent owner
      const fakeOwnerId = new mongoose.Types.ObjectId();
      const RestaurantModel = require('../functions/models/RestaurantModel');
      const restaurant = new RestaurantModel({
        idOwner: fakeOwnerId,
        name: 'Orphan Restaurant',
        address: { street: 'St', city: 'City', postalCode: '11000' },
        openingTime: {
          monday: { from: '08:00', to: '22:00', isOpen: true },
          tuesday: { from: '08:00', to: '22:00', isOpen: true },
          wednesday: { from: '08:00', to: '22:00', isOpen: true },
          thursday: { from: '08:00', to: '22:00', isOpen: true },
          friday: { from: '08:00', to: '22:00', isOpen: true },
          saturday: { from: '08:00', to: '22:00', isOpen: true },
          sunday: { from: '08:00', to: '22:00', isOpen: true },
        },
      });
      await restaurant.save();

      const res = await request(app).get(
        `/api/transaction/paymentMethods/${restaurant._id}`
      );

      expect(res.status).toBe(404);
      expect(res.body.msg).toBe('Merchant not found');
    });
  });

  // ============================================
  // POST /api/transaction
  // ============================================
  describe('POST /api/transaction', () => {
    it('should reject transaction without required fields', async () => {
      const res = await request(app)
        .post('/api/transaction')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject transaction without restaurant', async () => {
      const res = await request(app)
        .post('/api/transaction')
        .send({
          paymentGate: 'comgate',
          orders: [{ ean: '123', name: 'Test', price: 100, quantity: 1 }],
          email: 'test@test.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject transaction for non-existent restaurant', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post('/api/transaction')
        .send({
          restaurant: { _id: fakeId },
          paymentGate: 'comgate',
          orders: [{ ean: '123', name: 'Test', price: 100, quantity: 1 }],
          email: 'test@test.com',
        });

      expect(res.status).toBe(404);
      expect(res.body.msg).toBe('Restaurant not found!');
    });

    it('should reject unsupported payment gate', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Gate Test',
        isAvailable: true,
      });

      const res = await request(app)
        .post('/api/transaction')
        .send({
          restaurant: { _id: restaurant._id },
          paymentGate: 'paypal', // Not supported
          orders: [{ ean: '123', name: 'Test', price: 100, quantity: 1 }],
          email: 'test@test.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.msg).toContain('Not supported payment gate');
    });

    it('should reject if payment gate not available for merchant', async () => {
      const merchant = await createTestMerchant({
        ico: '25596641',
        paymentGates: {
          comgate: {
            isAvailable: false,
          },
        },
      });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'No Gate',
        isAvailable: true,
      });

      const res = await request(app)
        .post('/api/transaction')
        .send({
          restaurant: { _id: restaurant._id },
          paymentGate: 'comgate',
          orders: [{ ean: '123', name: 'Test', price: 100, quantity: 1 }],
          email: 'test@test.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.msg).toContain('not available');
    });
  });

  // ============================================
  // GET /api/transaction/:idTransaction (Guest endpoint)
  // ============================================
  describe('GET /api/transaction/:idTransaction', () => {
    it('should return transaction by refId', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Trans Restaurant',
        isAvailable: true,
      });
      const transaction = await createTestTransaction(restaurant._id, {
        refId: 'TESTABC1',
      });

      const res = await request(app).get('/api/transaction/TESTABC1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.msg.transaction.refId).toBe('TESTABC1');
    });

    it('should include restaurant info in response', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Info Restaurant',
        isAvailable: true,
      });
      await createTestTransaction(restaurant._id, { refId: 'INFORES1' });

      const res = await request(app).get('/api/transaction/INFORES1');

      expect(res.status).toBe(200);
      expect(res.body.msg.restaurant).toBeDefined();
      expect(res.body.msg.restaurant.name).toBe('Info Restaurant');
    });

    it('should return 404 for non-existent transaction', async () => {
      const res = await request(app).get('/api/transaction/NOTEXIST');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return cart items in transaction', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Cart Restaurant',
        isAvailable: true,
      });
      await createTestTransaction(restaurant._id, {
        refId: 'CARTITM1',
        cart: {
          orders: [
            { ean: '111', name: 'Item 1', price: 50, quantity: 2 },
            { ean: '222', name: 'Item 2', price: 100, quantity: 1 },
          ],
        },
      });

      const res = await request(app).get('/api/transaction/CARTITM1');

      expect(res.status).toBe(200);
      expect(res.body.msg.transaction.cart.orders).toHaveLength(2);
    });

    it('should return delivery method info', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Delivery Restaurant',
        isAvailable: true,
      });
      await createTestTransaction(restaurant._id, {
        refId: 'DELIVER1',
        deliveryMethod: { name: 'Table 5', id: 'table-5' },
      });

      const res = await request(app).get('/api/transaction/DELIVER1');

      expect(res.status).toBe(200);
      expect(res.body.msg.transaction.deliveryMethod.name).toBe('Table 5');
    });

    it('should return tips info', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Tips Restaurant',
        isAvailable: true,
      });
      await createTestTransaction(restaurant._id, {
        refId: 'TIPSXXX1',
        tips: 50,
      });

      const res = await request(app).get('/api/transaction/TIPSXXX1');

      expect(res.status).toBe(200);
      expect(res.body.msg.transaction.tips).toBe(50);
    });

    it('should return payment status', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Status Restaurant',
        isAvailable: true,
      });
      await createTestTransaction(restaurant._id, {
        refId: 'STATUSX1',
        status: 'PAID',
        paymentMethod: {
          comgate: { transId: 'trans-123', status: 'PAID' },
        },
      });

      const res = await request(app).get('/api/transaction/STATUSX1');

      expect(res.status).toBe(200);
      expect(res.body.msg.transaction.status).toBe('PAID');
    });
  });

  // ============================================
  // Transaction Unique RefId Generation
  // ============================================
  describe('Transaction RefId Uniqueness', () => {
    it('should generate unique 8-character refIds', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Unique Test',
        isAvailable: true,
      });

      // Create multiple transactions and check refIds
      const refIds = new Set();
      for (let i = 0; i < 5; i++) {
        const trans = await createTestTransaction(restaurant._id, {
          refId: `REF${String(i).padStart(5, '0')}`,
        });
        expect(trans.refId).toHaveLength(8);
        expect(refIds.has(trans.refId)).toBe(false);
        refIds.add(trans.refId);
      }
    });

    it('should use uppercase alphanumeric characters', async () => {
      const merchant = await createTestMerchant({ ico: '25596641' });
      const restaurant = await createTestRestaurant(merchant._id, {
        name: 'Alphanum Test',
        isAvailable: true,
      });
      const trans = await createTestTransaction(restaurant._id, {
        refId: 'ABC12345',
      });

      // RefId should only contain uppercase letters and numbers
      expect(trans.refId).toMatch(/^[A-Z0-9]{8}$/);
    });
  });
});
