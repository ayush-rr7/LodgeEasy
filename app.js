
const express =  require('express');
const app = express();
const path= require('path');
const mongoose = require('mongoose');
const dotenv =require('dotenv');
const authRouter=require('./routes/authRouter')
const multer =require('multer');

const isAuth = require("./middleware/isAuth");
const isHost= require("./middleware/isHost");

//load env
dotenv.config();
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Keep the server attempting to connect for 5 seconds
    socketTimeoutMS: 45000,
})
  .then(() => console.log("Connected to MongoDB!"))
  .catch(err => console.error("Connection error:", err));


const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);


const storeRouter= require("./routes/storeRouter");
const {hostRouter}= require("./routes/hostRouter");
// const home = require('./models/home');

const rootDir =require("./utils/pathUtil");
app.set('view engine', 'ejs');
app.set('views',path.join(rootDir,'views'));

const store =new MongoDBStore({
 uri: process.env.MONGODB_URI,
 collection:'sessions'
});
   
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static(path.join(rootDir,'public')));
  app.use('/uploads',express.static(path.join(rootDir,'uploads')));
  app.use('/host/uploads',express.static(path.join(rootDir,'uploads')));
  app.use("/homes/uploads", express.static(path.join(rootDir, 'uploads')))
  
  app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: store
}));
  
 
  app.use((req, res, next) =>{
    res.locals.message = req.session.message;
  delete req.session.message;  
    req.isLoggedIn = req.session.isLoggedIn || false
    console.log(req.isLoggedIn);
  
    next();
   });

  app.use(authRouter); 
  
  app.use(storeRouter );
  app.use("/host",  isAuth, isHost, hostRouter);
  
  
  


  app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).render("400", { message: "Something went wrong" });
});

      
  

// const PORT = 3006;
const PORT = process.env.PORT || 3006;

app.listen(PORT, ()=>{
  console.log(`Server is running on http://localhost:${PORT}`)
});