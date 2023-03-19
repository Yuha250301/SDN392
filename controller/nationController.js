const Nation = require("../models/nation");

var jwt = require("jsonwebtoken");
const config = require("../config/config");
const Player = require("../models/player");

const errMessage = "Nation already exist!";
const authMessage = "Only Admin can do this action!";

class nationController {
  index(req, res, next) {
    var token = req.cookies.accessToken;
    let search = req.query.search;
    let page = req.query.page;
    if (!search) search = '';
    if (!page) page = 1;
    if (token) {
      var data = jwt.verify(req.cookies.accessToken, config.secretKey);
      if (data.user.isAdmin) {
        Nation.find({
            "name": {
              "$regex": `${search}`,
              "$options": "i"
            }
          })
          .then((nation) => {
            res.render("nation", {
              title: "The list of Nations",
              maxPage: Math.ceil(nation.length / 4),
              nation: nation.splice(4 * (page - 1), 4),
              checkAdmin: true,
              message: "",
              authMessage: "",
              user: data.user,
              search,
              page
            });
          })
          .catch(next);
      } else {
        Nation.find({
            "name": {
              "$regex": `${search}`,
              "$options": "i"
            }
          })
          .then((nation) => {
            res.render("nation", {
              title: "The list of Nations",
              maxPage: Math.ceil(nation.length / 4),
              nation: nation.splice(4 * (page - 1), 4),
              checkAdmin: false,
              message: "",
              authMessage: "",
              user: data.user,
              search
            });
          })
          .catch(next);
      }
    } else {
      Nation.find({
          "name": {
            "$regex": `${search}`,
            "$options": "i"
          }
        })
        .then((nation) => {
          res.render("nation", {
            title: "The list of Nations",
            maxPage: Math.ceil(nation.length / 4),
            nation: nation.splice(4 * (page - 1), 4),
            checkAdmin: false,
            message: "",
            authMessage: "",
            user: false,
            search
          });
        })
        .catch(next);
    }
  }
  create(req, res, next) {
    const nation = new Nation(req.body);
    const nationName = req.body.name;
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    if (data.user.isAdmin) {
      nation
        .save()
        .then(() => {
          res.redirect("/nations");
        })
        .catch(() => {
          Nation.find({
            name: nationName
          }).then((nation) => {
            req.flash("error_msg", "Name already exist!");
            res.redirect("/nations");
          });
        });
    } else {
      req.flash("error_msg", authMessage);
      res.redirect("/nations");
    }
  }

  edit(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    if (data.user.isAdmin) {
      const nationID = req.params.nationID;
      Nation.findById(nationID)
        .then((nation) => {
          res.render("editNation", {
            title: "The list of Nations",
            nation: nation,
            checkAdmin: true,
            message: "",
            user: data.user,
          });
        })
        .catch(next);
    } else {
      req.flash("error_msg", authMessage);
      res.redirect("/nations");
    }
  }
  update(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    if (data.user.isAdmin) {
      const nationID = req.params.nationID;
      Nation.updateOne({
          _id: nationID
        }, req.body)
        .then(() => {
          res.redirect("/nations");
        })
        .catch(() => {
          Nation.findById(nationID).then((nation) => {
            res.render("editNation", {
              title: "The list of Nations",
              nation: nation,
              message: errMessage,
              user: data.user,
            });
          });
        });
    } else {
      req.flash("error_msg", authMessage);
      res.redirect("/nations");
    }
  }

  async delete(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    if (data.user.isAdmin) {
      const nationID = req.params.nationID;
      // Player.findById("");
      let deleted = true;
      let errors = "";

      await Player.find({
        "nation": nationID
      }).then((player) => {
        console.log(player);
        if (player.length !== 0) {
          deleted = false;
        }
        errors = "Sorry, this nation have players!!!!"
        console.log(deleted);
      }).catch((err) => {
        deleted = true;
      })

      if (deleted) {
        Nation.findByIdAndDelete({
            _id: nationID
          })
          .then(() => {
            res.redirect("/nations");
          })
          .catch(next);
      } else {
        req.flash("error_msg", errors);
        res.redirect("/nations");
      }

    } else {
      req.flash("error_msg", authMessage);
      res.redirect("/nations");
    }
  }
}

module.exports = new nationController();