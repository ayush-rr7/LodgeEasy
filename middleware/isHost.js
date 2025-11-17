module.exports = (req, res, next) => {
  console.log(req.session.user.userType);
  if (!req.session.user || req.session.user.userType !== "Host") {
    return res.redirect("/");
  }
  next();
};