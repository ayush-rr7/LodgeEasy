module.exports = (req, res, next) => {
  console.log(req.session.user.userType);
  if (!req.session.user || req.session.user.userType !== "Host") {
     err.statusCode = 403;
        return next(err);
  }
  next();
};

