
// const express= require('express') ;
// const authRouter= express.Router();

// const authController = require("../controllers/authController");
// authRouter.get("/login", authController.getLogin);
// authRouter.post("/login", authController.postLogin);
// authRouter.post("/logout",authController.postLogout);
// authRouter.get("/signup", authController.getSignup);
// authRouter.post("/signup",authController.signupValidators, // validation middleware
//                            authController.postSignup        // controller
// );
// authRouter.get("/profile",authController.postProfile);
// module.exports =authRouter; 

const express = require("express");
const authRouter = express.Router();

const authController = require("../controllers/authController");




// Signup
authRouter.get("/signup", authController.getSignup);

// Send email verification link
authRouter.post("/signup/send-code", authController.sendVerificationCode);

// Email verification
authRouter.get("/signup/verify/:token", authController.verifyEmail);
authRouter.get("/signup/check-status", authController.checkEmailStatus);


authRouter.post("/signup", authController.signupValidators, authController.postSignup);


// Login
authRouter.get("/login", authController.getLogin);
authRouter.post("/login", authController.postLogin);

// Logout
authRouter.post("/logout", authController.postLogout);

authRouter.get("/profile",authController.postProfile);

module.exports = authRouter;
