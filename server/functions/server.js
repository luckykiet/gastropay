// Imports
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const passport = require('passport');
const multer = require('multer');
const expressSession = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(expressSession);
const locale = require('locale');
const config = require('./config/config');
const createError = require('http-errors');

// IP address
const useProxy = process.env.USE_PROXY === 'true';

// Database connection
const mongoose = require('mongoose');
let store;

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || config.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log('MongoDB connected');

        // Setup session store
        store = new MongoDBStore({
            uri: process.env.MONGODB_URI || config.MONGODB_URI,
            collection: 'sessions',
            connectionOptions: {
                serverSelectionTimeoutMS: 10000,
            },
        });

        store.on('error', (error) => {
            console.log(error);
        });

        return true;
    } catch (error) {
        console.error('Database connection error:', error.message);
        return false;
    }
};

// Initialize passport
require('./security/passport');

// Cors options
const corsOnlyAppAllowedOption = {
    origin: config.BASE_URL,
};

// Inits
const app = express();
app.use(helmet());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Compression middleware
app.use(
    compression({
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            return compression.filter(req, res);
        },
        level: 6,
        threshold: 10 * 1000,
    }),
);

// Session setup
app.use(
    expressSession({
        secret: process.env.SESSION_SECRET || 'SomeR@aLLy$3crEt!@#',
        store: store,
        cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 7 days
        resave: true,
        saveUninitialized: true,
    }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(locale(config.LANGUAGES || ['en', 'de']));

// File upload setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public routes (anyone can access)
const GuestRouter = require('./routes/guest');

// External authenticated routes (requires passport auth)
const AuthenticateRouter = require('./routes/auth');
const RestaurantRouter = require('./routes/restaurant');
const MerchantRouter = require('./routes/merchant');
const TransactionRouter = require('./routes/transaction');
const ProxyRouter = require('./routes/proxy');
const PosRouter = require('./routes/pos');
const AuthExternalRouter = require('./routes/auth');

// In-app API routes (internal, requires passport auth)
const ApiRouter = require('./routes/api');
const ApiV1Router = require('./routes/api/v1');
const ModRouter = require('./routes/mod');

// ============================================
// ROUTE PATTERNS:
// - /public/*  : Public API (anyone)
// - /api/*     : External authenticated API (passport)
// - /mod/*     : In-app internal API (passport)
// ============================================

// Public routes (no authentication required)
app.use('/public', GuestRouter);

// External authenticated API routes
app.use('/api/auth', AuthenticateRouter);
app.use('/api/restaurants', RestaurantRouter);
app.use('/api/merchants', MerchantRouter);
app.use('/api/transactions', TransactionRouter);
app.use('/api/proxy', cors(corsOnlyAppAllowedOption), ProxyRouter);
app.use('/api/pos', PosRouter);
app.use('/api/auth-external', AuthExternalRouter);

// In-app internal API routes (mod)
app.use('/mod', upload, ModRouter);
app.use('/mod/v1', ApiV1Router);
app.use('/mod/core', ApiRouter);

// IP endpoint (public)
app.get('/public/ip', async (req, res) => {
    try {
        if (!useProxy) {
            const axios = require('axios');
            const response = await axios.get('http://httpbin.org/ip');
            return res
                .status(200)
                .json({ success: true, msg: response.data.origin });
        }
        const ip = process.env.PROXY_IP ?? "Unset proxy IP Address, please check .env file";
        return res
            .status(200)
            .json({ success: true, msg: ip });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, msg: "Failed to get IP Address" });
    }
});

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
    next(404);
});

// error handler
app.use((err, req, res, next) => {
    res.sendStatus(err);
});

// Initialize database and run startup functions
const init = async () => {
    const connected = await connectDB();
    if (connected) {
        try {
            console.log('Running initialization checks...');

            // Run essential functions first
            const initFunctions = require('./controllers/init');
            await initFunctions.createWebUser();
            await initFunctions.createBanks();

            // Only run heavy operations in development or if explicitly needed
            if (process.env.RUN_MIGRATIONS === 'true' || process.env.NODE_ENV === 'development') {
                console.log('Running database migrations...');
                await initFunctions.addDateCreated();
                await initFunctions.addSettingsForUsers();
                await initFunctions.fixTinLessThanEightCharacters();
                await initFunctions.cleanDuplicateTelephonesOrEmails();
                console.log('Database migrations completed');
            }

            console.log('Initialization completed');
        } catch (error) {
            console.error('Initialization error:', error.message);
        }
    }
};

// Run auto-check/payment intervals (non-test environment only)
if (process.env.NODE_ENV !== 'test') {
    const TransactionController = require('./controllers/transaction-controller');
    setInterval(TransactionController.runAutoCheckPayment, 20000);
    setInterval(TransactionController.runAutoSendToPos, 20000);
}

init();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;