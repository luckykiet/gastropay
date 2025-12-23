/**
 * Test helpers and fixtures
 */
const MerchantModel = require('../functions/models/MerchantModel');
const RestaurantModel = require('../functions/models/RestaurantModel');
const TransactionModel = require('../functions/models/TransactionModel');
const jwt = require('jsonwebtoken');
const config = require('../functions/config/config');

/**
 * Create a test merchant
 */
const createTestMerchant = async (overrides = {}) => {
  const defaultMerchant = {
    email: 'test@example.com',
    password: 'Test123456',
    ico: '12345678',
    name: 'Test Merchant',
    address: {
      street: 'Test Street 123',
      city: 'Prague',
      postalCode: '11000',
    },
    telephone: '+420123456789',
    isAvailable: true,
    paymentGates: {
      comgate: {
        merchant: 'test_merchant',
        secret: 'test_secret',
        curr: 'CZK',
        method: 'ALL',
        label: 'Test Payment',
        country: 'CZ',
        test: true,
        isAvailable: true,
      },
    },
    ...overrides,
  };

  const merchant = new MerchantModel(defaultMerchant);
  await merchant.save();
  return merchant;
};

/**
 * Create a test restaurant
 */
const createTestRestaurant = async (ownerId, overrides = {}) => {
  const defaultRestaurant = {
    idOwner: ownerId,
    name: 'Test Restaurant',
    address: {
      street: 'Restaurant Street 1',
      city: 'Prague',
      postalCode: '11000',
    },
    openingTime: {
      monday: { from: '08:00', to: '22:00', isOpen: true },
      tuesday: { from: '08:00', to: '22:00', isOpen: true },
      wednesday: { from: '08:00', to: '22:00', isOpen: true },
      thursday: { from: '08:00', to: '22:00', isOpen: true },
      friday: { from: '08:00', to: '22:00', isOpen: true },
      saturday: { from: '10:00', to: '20:00', isOpen: true },
      sunday: { from: '10:00', to: '18:00', isOpen: false },
    },
    image: 'https://example.com/restaurant.jpg',
    isAvailable: true,
    api: {
      key: 'test-api-key',
      menuUrl: 'https://example.com/menu',
      posUrl: 'https://example.com/pos',
      verifyUrl: 'https://example.com/verify',
      contentType: 'json',
    },
    ...overrides,
  };

  const restaurant = new RestaurantModel(defaultRestaurant);
  await restaurant.save();
  return restaurant;
};

/**
 * Create a test transaction
 */
const createTestTransaction = async (restaurantId, overrides = {}) => {
  const defaultTransaction = {
    refId: 'TEST1234',
    idRestaurant: restaurantId,
    status: 'PENDING',
    cart: {
      orders: [
        {
          ean: '1234567890123',
          name: 'Test Item',
          price: 100,
          quantity: 2,
        },
      ],
    },
    tips: 20,
    email: 'customer@example.com',
    deliveryMethod: {
      name: 'Table 1',
      id: 'table-1',
    },
    paymentMethod: {
      comgate: {
        transId: 'test-trans-id',
        status: 'PENDING',
      },
    },
    ...overrides,
  };

  const transaction = new TransactionModel(defaultTransaction);
  await transaction.save();
  return transaction;
};

/**
 * Generate auth token for merchant
 */
const generateAuthToken = (merchantId, ico) => {
  return jwt.sign(
    { userId: merchantId.toString(), ico },
    config.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Login and get token
 */
const loginMerchant = async (request, app, email, password) => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return response.body.msg?.token;
};

/**
 * Valid ICO numbers for testing (pass checksum)
 */
const validIcos = [
  '25596641', // Valid checksum
  '27082440', // Valid checksum
  '45274649', // Valid checksum
];

/**
 * Invalid ICO numbers for testing
 */
const invalidIcos = [
  '12345678', // Invalid checksum (but valid format)
  '1234567',  // Too short
  '123456789', // Too long
  'abcdefgh',  // Non-numeric
];

module.exports = {
  createTestMerchant,
  createTestRestaurant,
  createTestTransaction,
  generateAuthToken,
  loginMerchant,
  validIcos,
  invalidIcos,
};
