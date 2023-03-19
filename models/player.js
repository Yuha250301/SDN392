const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playerSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
    },
    image: {
      type: String,
      require: true,
    },
    nation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'nations'
    },
    club: {
      type: String,
      require: true,
    },
    position: {
      type: String,
      require: true,
    },
    goals: {
      type: Number,
      require: true,
      default: 0,
    },
    isCaptain: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

var Player = mongoose.model("players", playerSchema);
module.exports = Player;
