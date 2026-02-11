const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const connectDB = async () => {
    // Skip connection if already connected (e.g., in tests)
    if (mongoose.connection.readyState === 1) {
        console.log('MongoDB already connected');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected!');
    } catch (err) {
        console.error(err.message);
        // Don't exit in test environment
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
    }
};

module.exports = connectDB;
