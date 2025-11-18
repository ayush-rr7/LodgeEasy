module.exports = (req, res, next) => {
  console.log(req.session.user.userType);
  if (!req.session.user || req.session.user.userType !== "Guest") {const err = new Error('Access Denied. Only guests can access this feature.');
        // 🛑 Attach the status code manually
        err.statusCode = 403;
        return next(err);
  }
  next(); 
};