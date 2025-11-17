
const express= require('express') ;
const hostRouter = express.Router();
const {upload}= require("../config/upload");
const hostController = require("../controllers/hostController");



hostRouter.get("/add-home", hostController.getAddHome);
hostRouter.post("/add-home",upload.single('imageURL'), hostController.postAddHome);
hostRouter.get("/home-list", hostController.getHostHomes);
hostRouter.get("/bookings", hostController.getBookings);

hostRouter.get("/edit-home/:homeId", hostController.getEditHome);
hostRouter.post("/edit-home",  upload.single('imageURL'),  hostController.postEditHome);
hostRouter.post("/delete-home/:homeId", hostController.postDeleteHome);


exports.hostRouter= hostRouter;



