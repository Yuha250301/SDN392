const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

var today = new Date();
var currentYear = today.getFullYear();
var token = "";

class userController {
  index(req, res, next) {
    res.render("register", {
      title: "Register Page",
    });
  }
  async register(req, res, next) {
    console.log(req.body);
    const { name, yob, username, password } = req.body;
    let age = currentYear - yob;
    let errors = [];
    if (!username || !password || !name || !yob) {
      errors.push({
        msg: "Please input all fields!",
      });
    }
    if (password.length < 6) {
      errors.push({
        msg: "Password must be at least 6 characters",
      });
    }
    if (age < 18 || age > 100) {
      errors.push({
        msg: "You must be over 18 years old and less than 100 years old!",
      });
    }
    if (errors.length > 0) {
      console.log(errors);
      res.render("register", {
        title: "Register Error",
        errors: errors,
        name: name,
        yob: yob,
        username: username,
        password: password,
      });
    } else {
      await User.findOne({
        username: username,
      }).then((user) => {
        if (user) {
          errors.push({
            msg: "Username already exists",
          });
          res.render("register", {
            title: "Register Page",
            errors: errors,
            name: name,
            yob: yob,
            username: username,
            password: password,
          });
        } else {
          const newUser = new User({
            name: name,
            yob: yob,
            username: username,
            password: password,
            isAdmin: false,
          });
          //Hash password
          bcrypt.hash(newUser.password, 10, function (err, hash) {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                res.redirect("/auth");
              })
              .catch(next);
          });
        }
      });
    }
  }
  login(req, res, next) {
    res.render("login", {
      title: "Login Page",
    });
  }
  signIn(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    User.findOne({
      username: username,
    })
      .then((user) => {
        if (user) {
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              token = jwt.sign(
                {
                  user,
                },
                config.secretKey
              );
              res.cookie("accessToken", token);
              res.redirect("/players");
            } else {
              req.flash("error_msg", "Password incorrect!");
              res.redirect("/auth");
            }
          });
        } else {
          req.flash("error_msg", "Username not exist!");
          res.redirect("/auth");
        }
      })
      .catch((err) => console.log(err));
  }
  signOut(req, res, next) {
    req.logout(function (err) {
      if (err) return next(err);
      //Clear token
      res.clearCookie("accessToken");
      req.flash("success_msg", "You are logged out!");
      res.redirect("/auth");
    });
  }
  account(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    var userID = data.user._id;
    var showListUser = false;
    if (data.user.isAdmin) {
      showListUser = true;
    }
    User.findById(userID).then((user) => {
      res.render("account", {
        title: "Account Page",
        user: user,
        showListUser: showListUser,
      });
    });
  }
  editAccount(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    var userID = data.user._id;
    User.findById(userID).then((user) => {
      res.render("editAccount", {
        title: "Edit Account",
        checkAdmin: user.isAdmin,
        user: user,
      });
    });
  }
  changePassword(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    var userID = data.user._id;
    User.findById(userID).then((user) => {
      res.render("changePassword", {
        title: "Change Password",
        checkAdmin: user.isAdmin,
        user: user,
      });
    });
  }
  updatePassword(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    var userID = data.user._id;

    const { oldPassword, newPassword, confirmPassword } = req.body;

    console.log(req.body);
    User.findById(userID).then((user) => {
      if (user) {
        bcrypt.compare(oldPassword, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            if (confirmPassword !== newPassword) {
              req.flash("error_msg", "Passwords do not match");
              res.redirect("/auth/account/updatePassword");
            } else {
              //Hash password
              bcrypt.hash(newPassword, 10, function (err, hash) {
                if (err) throw err;
                let newPassword = hash;
                user.update({ password: newPassword }).then((user) => {
                  //Clear token
                  res.clearCookie("accessToken");
                  req.flash("success_msg", "Update password successfully");
                  res.redirect("/");
                });
              });
            }
          } else {
            req.flash("error_msg", "Password incorrect!");
            res.redirect("/auth/account/updatePassword");
          }
        });
      }
    });
  }
  updateAccount(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    var userID = data.user._id;
    let age = currentYear - req.body.yob;
    let errors = "";
    if (age < 18 || age > 100) {
      errors = "You must be over 18 years old and less than 100 years old!";
    }
    if (errors.length !== 0) {
      User.findById(userID).then((user) => {
        res.render("editAccount", {
          title: "Edit Account",
          user: user,
          error_msg: errors,
          checkAdmin: data.user.isAdmin,
        });
      });
    } else {
      User.updateOne(
        {
          _id: userID,
        },
        req.body
      )
        .then((user) => {
          console.log(user);
          req.flash("error_msg", "Successful");
          res.redirect("/auth/account/edit");
        })
        .catch((err) => {
          req.flash("error_msg", err);
          User.findById(userID).then((user) => {
            res.render("editAccount", {
              title: "Edit Account",
              user: user,
            });
          });
        });
    }
  }
  listUser(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    let search = req.query.search;
    let page = req.query.page;
    if (!search) search = "";
    if (!page) page = 1;
    if (data.user.isAdmin) {
      User.find({
        username: {
          $regex: `${search}`,
          $options: "i",
        },
      })
        .then((user) => {
          user = user.filter((e) => e.username != data.user.username);
          res.render("listUser", {
            title: "List User",
            maxPage: Math.ceil(user.length / 4),
            user: user.splice(4 * (page - 1), 4),
            org: data.user.username,
            search,
            page,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      req.flash("error_msg", "Only Admin can do this action!");
      res.redirect("/auth/account");
    }
  }
}

module.exports = new userController();