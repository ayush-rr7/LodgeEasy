const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user");
const { sendEmail } = require("../utils/sendEmail");
const TempUser = require("../models/TempUser");

// ------------------------
// VALIDATION RULES
// ------------------------
exports.signupValidators = [
  check("firstName").notEmpty().withMessage("First name is required."),
  check("lastName").notEmpty().withMessage("Last name is required."),
  check("city").notEmpty().withMessage("City is required."),

  check("email")
    .isEmail()
    .withMessage("Invalid email.")
    .bail()
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) throw new Error("Email already exists.");
    }),

  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
];

// ------------------------
// GET SIGNUP
// ------------------------
exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    errors: [],
    oldInput: {},
    isLoggedIn: false,
   pageTitle: "Singup Yourself"
  });
};

// -----------------------------------
// 1) SEND VERIFICATION EMAIL
// -----------------------------------
exports.sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);

    //check if email already exist in User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email already registered." });
    }

    // remove old temp entry
    await TempUser.deleteOne({ email });

    const token = crypto.randomBytes(32).toString("hex");

    const temp = new TempUser({
      email,
      token,
      expiresAt: Date.now() + 1000 * 60 * 15, // 5 minutes
    });

    await temp.save();

    const verifyURL = `${req.protocol}://${req.get(
      "host"
    )}/signup/verify/${token}`;

    await sendEmail(
      email,
      "Verify Email",
      `<p>Click below to verify:</p><a href="${verifyURL}">${verifyURL}</a>`
    );

    return res.json({ success: true, message: "Verification email sent." });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: "Error sending email." });
  }
};

// -----------------------------------
// 2) VERIFIED LINK CLICK (Correct Error Handling)
// -----------------------------------

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params; // CHANGED — earlier token missing error
    console.log("Verifying token:", token);

    // Find user by token
    const tempUser = await TempUser.findOne({ token }); // CHANGED — variable name
    if (!tempUser) {
      return res.send("Invalid or expired token.");
    }

    console.log("Found temp user:", tempUser.email); // ADDED

    // Check expiry
    if (tempUser.expiresAt < Date.now()) {
      return res.send("Token expired.");
    }

    // Mark verified
    tempUser.emailVerified = true;
    await tempUser.save();

    console.log("Email verified:", tempUser.email);

    res.send(`
      <h2>Email Verified ✔</h2>
      <p>You may now return to your signup page.</p>
      <script>
        setTimeout(() => window.close(), 11000);
      </script>
    `);
  } catch (err) {
    console.error("Verification Error:", err);
    return res.send("Verification error.");
  }
};

// Polling route
exports.checkEmailStatus = async (req, res) => {
  const { email } = req.query;

  // console.log({email});
  const temp = await TempUser.findOne({ email });
  res.json({ verified: temp ? temp.emailVerified : false });
};

// -----------------------------------
// 3) COMPLETE SIGNUP AFTER VERIFIED
// -----------------------------------
exports.postSignup = async (req, res) => {
  try {
    const errors = validationResult(req);
    const { firstName, lastName, city, email, password, userType } = req.body;

    console.log(req.body);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        errors: errors.array(),
        oldInput: { firstName, lastName, city, email, userType },
        isLoggedIn: false,
       pageTitle: "Signup"
      });
    }

    const temp = await TempUser.findOne({ email, emailVerified: true });

    if (!temp || !temp.emailVerified) {
      return res.status(422).render("auth/signup", {
        errors: [{ msg: "Email not verified" }],
        oldInput: { firstName, lastName, city, email, userType },
        isLoggedIn: false,
        pageTitle: "Signup"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      firstName,
      lastName,
      city,
      email,
      password: hashedPassword,
      userType,

      emailVerified: true,
    });

    await user.save();

    // delete temp data
    await TempUser.deleteOne({ email });

    res.send("Signup completed successfully!");
  } catch (err) {
    console.log(err);
    res.send("Error completing signup");
  }
};

// ------------------------
// GET LOGIN
// ------------------------
exports.getLogin = (req, res) => {
  res.render("auth/login", {
    errors: [],
    oldInput: {},
    isLoggedIn: false,
    pageTitle: "Login To Your Account"
  });
};

// ------------------------
// POST LOGIN
// ------------------------
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(422).render("auth/login", {
        errors: [{ msg: "Invalid email or password" }],
        oldInput: { email },
        isLoggedIn: false,
        pageTitle:"Login Yourself"
      });
    }

    if (!user.emailVerified) {
      return res.status(422).render("auth/login", {
        errors: [{ msg: "Please verify your email first." }],
        oldInput: { email },
        isLoggedIn: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(422).render("auth/login", {
        errors: [{ msg: "Invalid email or password" }],
        oldInput: { email },
        isLoggedIn: false,
        pageTitle:"Login Yourself"
        
      });
    }

    req.session.user = user;
    req.session.isLoggedIn = true;
    return req.session.save(() => res.redirect("/"));
  } catch (error) {
    console.error("Login Error:", error);

    // Final fallback (never crash)
    return res.status(500).render("auth/login", {
      errors: [{ msg: "Server error. Please try again later." }],
      oldInput: { email: req.body.email },
      isLoggedIn: false,
      pageTitle:"Login Yourself"
    });
  }
};

// ------------------------
// LOGOUT
// ------------------------
exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.postProfile = (req, res) => {
  const user = req.session.user;
  res.render("auth/profile", { isLoggedIn: req.isLoggedIn, user: user, pageTitle: "Your Profile" });
};
