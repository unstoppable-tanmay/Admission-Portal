const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      default: "student"
    },
    userID: {
      type: String,
      require: true
    },
    password: {
      type: String,
      require: true
    },
    applied: {
      type: Boolean,
      default: false,
    },
    form: {
      type: {
        name: {
          type: String,
        },
        email: {
          type: String,
        },
        address: {
          type: String,
        },
        phone: {
          type: Number,
        },
        img: {
          type: String,
        },
        tenth: {
          type: String,
        },
        twelve: {
          type: String,
        },
        residence: {
          type: String,
        },
        income: {
          type: String,
        },
        caste: {
          type: String,
        },
        adhara: {
          type: String,
        },
        bloodGroup: {
          type: String,
          enum: ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"],
        },
      },
      default: {}
    },
    error: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      default: "Applied",
      enum: [
        "Applied",
        "Processing",
        "Validating",
        "Error",
        "Approved",
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);