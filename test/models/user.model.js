const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      dropDups: true,
    },

    password: {
      type: String,
      required: true,
    },

    isActivated: {
      type: Boolean,
      required: true,
      default: true,
    },

    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("User", schema);
