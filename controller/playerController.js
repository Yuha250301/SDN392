const Player = require("../models/player");
const Nation = require("../models/nation");

var jwt = require("jsonwebtoken");
const config = require("../config/config");

let clubData = [{
    id: "1",
    name: "Arsenal"
  },
  {
    id: "2",
    name: "Manchester United"
  },
  {
    id: "3",
    name: "Chelsea"
  },
  {
    id: "4",
    name: "Manchester City"
  },
  {
    id: "5",
    name: "PSG"
  },
  {
    id: "6",
    name: "Inter Milan"
  },
  {
    id: "7",
    name: "Real Madrid"
  },
  {
    id: "8",
    name: "Barcelona"
  },
];

let isCaptain = [{
    id: "1",
    name: "Captain"
  },
  {
    id: "2",
    name: "Not Captain"
  },
];

let positionList = [{
    id: "1",
    name: "GK"
  },
  {
    id: "2",
    name: "RB"
  },
  {
    id: "3",
    name: "CB"
  },
  {
    id: "4",
    name: "LB"
  },
  {
    id: "5",
    name: "CDM"
  },
  {
    id: "6",
    name: "CM"
  },
  {
    id: "7",
    name: "CAM"
  },
  {
    id: "8",
    name: "RW"
  },
  {
    id: "9",
    name: "LW"
  },
  {
    id: "10",
    name: "ST"
  },
];

const nations = [];

function getNation() {
  Nation.find({}).then((nation) => {
    nations.push(nation);
  });
}

const errMessage = "Player name already exist!";
const authMessage = "Only Admin can do this action!";

class playerController {
  index(req, res, next) {
    var token = req.cookies.accessToken;
    let search = req.query.search;
    let page = req.query.page;
    let nationFilter = req.query.nationFilter;
    let positionFilter = req.query.positionFilter;
    if (!nationFilter) nationFilter ='';
    if (!positionFilter) positionFilter ='';
    if (!search) search = '';
    if (!page) page = 1;
    res.locals.nationFilter = nationFilter;
    res.locals.positionFilter = positionFilter;
    res.locals.positions = positionList;
    let nations = []
    Nation.find({}).then((rs) => {nations = rs}).catch();
    if (token) {
      var data = jwt.verify(req.cookies.accessToken, config.secretKey);
      if (data.user.isAdmin) {
        Promise.all([Player.find({
            "name": {
              "$regex": `${search}`,
              "$options": "i"
            }
          }).populate('nation', 'image name'), Nation.find({})])
          .then((rs) => {
            let value = rs;
            if (nationFilter !== '') 
            value[0] = value[0].filter((player) => {
              return player.nation.name === nationFilter;
            })
            if (positionFilter !== '') 
            value[0] = value[0].filter((player) => {
              return player.position === positionFilter;
            })
            res.render("player", {
              title: "The list of Players",
              maxPage: Math.ceil(value[0].length / 4),
              player: value[0].splice(4*(page-1), 4),
              clubList: clubData,
              isCaptainList: isCaptain,
              message: "",
              checkAdmin: true,
              nations: nations,
              positions: positionList,
              user: data.user,
              search,
              page
            });
          })
          .catch(next);
      } else {
        Player.find({
            "name": {
              "$regex": `${search}`,
              "$options": "i"
            }
          }).populate('nation', 'image name')
          .then((rs) => {
            let player = rs
            if (nationFilter !== '') 
            player = player.filter((players) => {
              return players.nation.name === nationFilter;
            })
            if (positionFilter !== '') 
            player = player.filter((players) => {
              return players.position === positionFilter;
            })
            res.render("player", {
              title: "The list of Players",
              maxPage: Math.ceil(player.length / 4),
              player: player.splice(4*(page-1), 4),
              clubList: clubData,
              isCaptainList: isCaptain,
              message: "",
              checkAdmin: false,
              nations: nations,
              positions: positionList,
              user: data.user,
              search,
              page,
            });
          })
          .catch(next);
      }
    } else {
      Player.find({
          "name": {
            "$regex": `${search}`,
            "$options": "i"
          }
        }).populate('nation', 'image name')
        .then((rs) => {
          let player = rs
            if (nationFilter !== '') 
            player = player.filter((players) => {
              return players.nation.name === nationFilter;
            })
            if (positionFilter !== '') 
            player = player.filter((players) => {
              return players.position === positionFilter;
            })
          res.render("player", {
            title: "The list of Players",
            maxPage: Math.ceil(player.length / 4),
            player: player.splice(4*(page-1), 4),
            clubList: clubData,
            isCaptainList: isCaptain,
            message: "",
            checkAdmin: false,
            nations: nations,
            positions: positionList,
            user: false,
            search,
            page,
          });
        })
        .catch(next);
    }
  }

  create(req, res, next) {
    const newPlayer = new Player(req.body);
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    if (data.user.isAdmin) {
      getNation();
      newPlayer
        .save()
        .then(() => {
          res.redirect("/players");
        })
        .catch(() => {
          Player.find({}).populate('nation', 'image')
            .then((player) => {
              req.flash("error_msg", "Name already exist!");
              res.redirect("/players");
            })
            .catch(next);
        });
    }
  }

  edit(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    if (data.user.isAdmin) {
      const playerID = req.params.playerID;
      Promise.all([Nation.find({}), Player.findById(playerID).populate('nation', 'image')])
        .then((value) => {
          console.log(value);
          if (!value[1]) res.render('error');
          res.render("editPlayer", {
            title: "The detail of Player",
            player: value[1],
            clubList: clubData,
            isCaptainList: isCaptain,
            checkAdmin: true,
            message: "",
            nations: value[0],
            positions: positionList,
            user: data.user,
          });
        })
        .catch(next);
    } else {
      req.flash("error_msg", authMessage);
      res.redirect("/players");
    }
  }
  update(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    if (data.user.isAdmin) {
      getNation();
      const playerID = req.params.playerID;
      console.log(playerID);
      Player.findOneAndUpdate({
          _id: playerID
        }, req.body)
        .then(() => {
          res.redirect("/players");
        })
        .catch(() =>
          Player.findById(playerID).populate('nation', 'image').then((player) => {
            res.render("editPlayer", {
              title: "The detail of Player",
              player: player,
              clubList: clubData,
              isCaptainList: isCaptain,
              message: errMessage,
              nations: nations,
              checkAdmin: true,
              positions: positionList,
              user: data.user,
            });
          })
        );
    } else {
      req.flash("error_msg", authMessage);
      res.redirect("/players");
    }
  }

  delete(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    if (data.user.isAdmin) {
      const playerID = req.params.playerID;
      Player.findByIdAndDelete({
          _id: playerID
        })
        .then(() => {
          res.redirect("/players");
        })
        .catch(next);
    } else {
      req.flash("error_msg", authMessage);
      res.redirect("/players");
    }
  }

  details(req, res, next) {
    const playerID = req.params.playerID;
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    Player.findById(playerID).populate('nation', 'image')
      .then((player) => {
        res.render("detailOfPlayer", {
          title: `Details of ${player.name}`,
          player: player,
          user: data.user,
        });
      })
      .catch(next);
  }
}

module.exports = new playerController();