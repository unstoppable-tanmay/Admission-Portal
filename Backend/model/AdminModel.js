const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      default: "admin"
    },
    userID: {
      type: String,
    },
    password: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);
