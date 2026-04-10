const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

// ENVIRONMENT & CONFIG
dotenv.config();

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

// ROUTE IMPORTS
const authRouter = require('./routes/authRouter');
const storeRouter = require('./routes/storeRouter');
const { hostRouter } = require('./routes/hostRouter');


// MIDDLEWARE IMPORTS
const isAuth = require('./middleware/isAuth');
const isHost = require('./middleware/isHost');


// UTILITIES
const rootDir = require('./utils/pathUtil');


// EXPRESS APP SETUP
const app = express();
const PORT = process.env.PORT || 3006;

// View Engine Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(rootDir, 'views'));


// STATIC & BODY PARSER MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(rootDir, 'public')));
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/host/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/homes/uploads', express.static(path.join(rootDir, 'uploads')));


// DATABASE CONNECTION & SERVER STARTUP
async function initializeApp() {
  try {
    // Step 1:Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });
    console.log('✅ Connected to MongoDB successfully!');

    // Initialize Session Store (only after MongoDB is connected)
    const store = new MongoDBStore({
      uri: process.env.MONGODB_URI,
      collection: 'sessions',
      touchAfter: 24 * 3600 // lazy session update interval in seconds
    });

    // Session store error handling
    store.on('error', (err) => {
      console.error('⚠️  Session Store Error:', err.message);
    });

    store.on('connected', () => {
      console.log('✅ Session store connected to MongoDB');
    });

    //  Configure Session Middleware
    app.use(
      session({
        secret: process.env.SESSION_SECRET || 'your-secret-key', // Use env variable
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
          httpOnly: true, // Prevent client-side JS from accessing the cookie
          secure: process.env.NODE_ENV === 'production', // HTTPS only in production
           sameSite: 'Lax'
        }
      })
    );

    //  Local Variables & Session Middleware
    app.use((req, res, next) => {
      res.locals.message = req.session.message;
      delete req.session.message;
      req.isLoggedIn = req.session.isLoggedIn || false;
      next();
    });

    //  Application Routes
    app.use(authRouter);
    app.use('/', storeRouter);
    app.use('/host', isAuth, isHost, hostRouter);

    // 404 Handler (must be after all routes)
    app.use((req, res, next) => {
      res.status(404).render('error', {
        pageTitle: 'Page Not Found',
        message: 'The page you are looking for does not exist.',
        status: 404
      });
    });

   //  Global Error Handler (must be last)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  console.error(`[ERROR ${statusCode}] ${err.message}`);
 
  res.status(statusCode).render('error', {
    pageTitle: statusCode >= 500 ? 'Internal Server Error' : 'Error',
    message: err.message || 'An unexpected error occurred.',
    status: statusCode
  });
});
 
//s-8: Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
 
// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  mongoose.connection.close();
  process.exit(0);
});
 
} catch (err) {
  console.error('Failed to start:', err.message);
  process.exit(1);
}
}
 
// Initialize the application
initializeApp();
// module.exports = app;
