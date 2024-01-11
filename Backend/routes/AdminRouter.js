const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

const Student = require("../model/UserModel");
const Admin = require("../model/AdminModel");

const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
  try {
    if (!req.body.userID) {
      return res.status(500).send({
        success: false,
        message: "userId Is Important",
      });
    }
    if (!req.body.password) {
      return res.status(500).send({
        success: false,
        message: "Password Is Important",
      });
    }

    // Finding User After Validation
    const user = await Admin.findOne({ userID: req.body.userID });

    // If There Is No User
    if (!user) {
      return res.status(401).send({
        success: false,
        message: "Invalid Credentials - Admin Not Found",
      });
    }

    if (req.body.password != user.password) {
      return res.status(500).send({
        success: false,
        message: "Invalid Credentials - Password",
      });
    }

    // Sign JWT token
    const token = jwt.sign({ userID: user._id, role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).cookie('JWT', token).send({
      success: true,
      message: "Login Successfully",
      user,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error,
    });
  }
});

// Admin Registering Student
router.post("/add-user", async (req, res) => {
  try {
    if (req.cookies.JWT) {
      const decoded_jwt = jwt.verify(req.cookies.JWT, process.env.JWT_SECRET)

      const user = await Admin.findOne({ _id: decoded_jwt.userID });

      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Invalid Credentials - User Not Found",
        });
      }

      const newStudent = new Student({ userID: req.body.userID, password: req.body.password })

      newStudent.save().then(data => {
        return res.status(200).send({
          success: true,
          message: "Successfully Created User",
        });
      }).catch(err => {
        console.log(err);
        res.status(500).send({
          success: false,
          message: err,
        });
      })
    } else {
      return res.status(500).send({
        success: false,
        message: "Not Signed In",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error,
    });
  }
});

// Login Admin by JWT
// router.get("/", async (req, res) => {
//   try {
//     if (req.cookies.JWT) {
//       const decoded_jwt = jwt.verify(req.cookies.JWT, process.env.JWT_SECRET)

//       const user = await Admin.findOne({ userID: decoded_jwt.userID });

//       if (!user) {
//         return res.status(404).send({
//           success: false,
//           message: "Invalid Credentials - User Not Found",
//         });
//       }

//       return res.status(200).send({
//         success: true,
//         message: "Successfully Logged in",
//         user
//       });

//     } else {
//       return res.status(500).send({
//         success: false,
//         message: "Not Signed In",
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: error,
//     });
//   }
// });

// Status Update
router.post("/status-update", async (req, res) => {
  try {
    if (req.cookies.JWT) {
      const decoded_jwt = jwt.verify(req.cookies.JWT, process.env.JWT_SECRET)

      const user = await Admin.findOne({ _id: decoded_jwt.userID });

      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Invalid Credentials - User Not Found",
        });
      }

      const student = await Student.findOne({ _id: req.body.id })

      student.status = req.body.status;

      student.save().then(data => {
        res.status(200).send({
          success: true,
          message: "Student Status Updated",
          user: data
        });
      }).catch(err => {
        console.log(err);
        res.status(500).send({
          success: false,
          message: err,
        });
      })

    } else {
      return res.status(500).send({
        success: false,
        message: "Not Signed In",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error,
    });
  }
});

// Error Raise
router.post("/error", async (req, res) => {
  try {
    if (req.cookies.JWT) {
      const decoded_jwt = jwt.verify(req.cookies.JWT, process.env.JWT_SECRET)

      const user = await Admin.findOne({ _id: decoded_jwt.userID });

      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Invalid Credentials - User Not Found",
        });
      }

      const student = await Student.findOne({ _id: req.body.id })

      student.error = req.body.error;

      student.save().then(data => {
        res.status(200).send({
          success: true,
          message: "Student Error Raised",
          user: data
        });
      }).catch(err => {
        console.log(err);
        res.status(500).send({
          success: false,
          message: err,
        });
      })

    } else {
      return res.status(500).send({
        success: false,
        message: "Not Signed In",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error,
    });
  }
});

router.get('/all-students', async (req, res) => {
  try {
    if (req.cookies.JWT) {
      const decoded_jwt = jwt.verify(req.cookies.JWT, process.env.JWT_SECRET)

      const user = await Admin.findOne({ _id: decoded_jwt.userID });

      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Invalid Credentials - User Not Found",
        });
      }

      const students = await Student.find({ applied: true })

      res.status(200).send({
        success: true,
        message: "Fetched User Successfully",
        students: students
      });

    } else {
      return res.status(500).send({
        success: false,
        message: "Not Signed In",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error,
    });
  }
})

router.get('/get-document/:id', async (req, res) => {
  try {
    if (req.cookies.JWT) {
      const decoded_jwt = jwt.verify(req.cookies.JWT, process.env.JWT_SECRET)

      const user = await Admin.findOne({ _id: decoded_jwt.userID });

      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Invalid Credentials - User Not Found",
        });
      }

      const student = await Student.find({ _id: req.params.id }).populate("form")
      console.log(student[0].form)

      res.status(200).send({
        success: true,
        message: "Fetched Files Successfully",
        files: {
          adhara: new Buffer.from(fs.readFileSync(path.join(__dirname, path.extname( student[0].form.adhara), 'adhara', student[0].form.adhara))),
          caste: new Buffer.from(fs.readFileSync(path.join(__dirname, path.extname( student[0].form.caste), 'caste', student[0].form.caste))),
          img: new Buffer.from(fs.readFileSync(path.join(__dirname, path.extname( student[0].form.img), 'img', student[0].form.img))),
          income: new Buffer.from(fs.readFileSync(path.join(__dirname, path.extname( student[0].form.income), 'income', student[0].form.income))),
          residence: new Buffer.from(fs.readFileSync(path.join(__dirname, path.extname( student[0].form.residence), 'residence', student[0].form.residence))),
          tenth: new Buffer.from(fs.readFileSync(path.join(__dirname, path.extname( student[0].form.tenth), 'tenth', student[0].form.tenth))),
          twelve: new Buffer.from(fs.readFileSync(path.join(__dirname, path.extname( student[0].form.twelve), 'twelve', student[0].form.twelve)))
        }
      });

    } else {
      return res.status(500).send({
        success: false,
        message: "Not Signed In",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error,
    });
  }
})




module.exports = router;
