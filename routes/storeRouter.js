

const express= require('express') ;
// const path= require('path');
const session = require('express-session');
const storeRouter = express.Router();


// // Local Module
const storeController = require("../controllers/storeController");

const isAuth = require("../middleware/isAuth");
const isGuest= require("../middleware/isGuest");

storeRouter.get("/home", storeController.getHomes);

storeRouter.get("/", storeController.getIndex);
// storeRouter.get("/homes", storeController.getHomes);

storeRouter.get("/search-results", storeController.getSearchResults);



storeRouter.get("/bookings/:homeId", isAuth, storeController.getBookings);
storeRouter.post("/booking/create/:homeId",isAuth,  storeController.postBookings);
storeRouter.get("/bookingList",isAuth,storeController.getBookingList);


storeRouter.get("/favourites", isAuth,isGuest,  storeController.getFavouriteList);

storeRouter.get("/homes/:homeId", storeController.getHomeDetails);
storeRouter.post("/favourites",isAuth,isGuest , storeController.postAddToFavourite);

storeRouter.post("/favourites/delete/:homeId", storeController.postRemoveFromFavourite);

storeRouter.get("/footer/:page",storeController.getFooterPage);
  module.exports= storeRouter;