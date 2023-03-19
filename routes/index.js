var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");
const config = require("../config/config");

const { ensureAuthenticated } = require("../config/auth");

/* GET home page. */
router.get("/", function (req, res, next) {
  var token = req.cookies.accessToken;
  if (token) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    res.render("index", { title: "My application", user: data.user });
  } else res.render("index", { title: "My application", user: false });
});

module.exports = router;
