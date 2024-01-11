const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Student = require("../model/UserModel");
const Admin = require("../model/AdminModel");

const router = express.Router();


// Function to generate a unique filename
const generateFilename = (file) => {
  const originalname = file.originalname;
  const ext = path.extname(originalname);
  return Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
};

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = file.fieldname; // Use the fieldname as the folder name
    const folderPath = path.join( __dirname, 'data', folderName);

    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    // Use the generateFilename function to create a unique filename
    const filename = generateFilename(file);
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });




// Student Login
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
    const user = await Student.findOne({ userID: req.body.userID });

    // If There Is No User
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Invalid Credentials - User Not Found",
      });
    }

    if (req.body.password != user.password) {
      return res.status(500).send({
        success: false,
        message: "Invalid Credentials - Password",
      });
    }

    // Sign JWT token
    const token = jwt.sign({ userID: user._id, role:"student" }, process.env.JWT_SECRET, {
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

// Login Student by JWT
// router.get("/", async (req, res) => {
//   try {
//     if (req.cookies.JWT) {
//       const decoded_jwt = jwt.verify(req.cookies.JWT, process.env.JWT_SECRET)

//       const user = await Student.findOne({ userID: decoded_jwt.userID });

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

// Submit Form By Student
router.post("/submit-form", upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'tenth', maxCount: 1 },
  { name: 'twelve', maxCount: 1 },
  { name: 'residence', maxCount: 1 },
  { name: 'income', maxCount: 1 },
  { name: 'caste', maxCount: 1 },
  { name: 'adhara', maxCount: 1 },
]), async (req, res) => {
  try {
    if (req.cookies.JWT) {
      const decoded_jwt = jwt.verify(req.cookies.JWT, process.env.JWT_SECRET)

      const user = await Student.findOne({ _id: decoded_jwt.userID });

      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Invalid Credentials - User Not Found",
        });
      }

      if (user.applied)
        return res.status(200).send({
          success: true,
          message: "Already Applied",
        });


      const filenames = Object.keys(req.files).reduce((acc, key) => {
        return { ...acc, [key]: req.files[key][0].filename };
      }, {});

      // Assign each filename to a separate variable
      const { img, tenth, twelve, residence, income, caste, adhara } = filenames;

      user.form = { name: req.body.name, email: req.body.email, address: req.body.address, phone: req.body.phone, bloodGroup: req.body.bloodGroup, img, tenth, twelve, residence, income, caste, adhara }

      user.applied = true

      user.save().then(data => {
        return res.status(200).send({
          success: true,
          message: "Successfully Uploaded Data",
          user: data
        });
      }).catch(err => {
        console.log(err);
        return res.status(500).send({
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

module.exports = router;