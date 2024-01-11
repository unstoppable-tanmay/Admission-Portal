const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const cors = require("cors");
var cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken");

const connectDB = require("./db/Connection");

const Student = require("./model/UserModel");
const Admin = require("./model/AdminModel");

//dot config
dotenv.config();

//mongodb connection
connectDB();

//rest object
const app = express();

//middlewares
app.use(express.json());
app.use(cors(
  {
    origin: 'http://localhost:3000',
    credentials: true,
    optionSuccessStatus: 200
  }));
app.use(morgan("dev"));
app.use(cookieParser())

//routes
app.get('/auth',async (req,res)=>{
  try {
    if (req.cookies.JWT) {
      const decoded_jwt = jwt.verify(req.cookies.JWT, process.env.JWT_SECRET)
      
      var user;

      if(decoded_jwt.role=='admin'){
        user = await Admin.findOne({ _id: decoded_jwt.userID });
      }else if(decoded_jwt.role=='student'){
        user = await Student.findOne({ _id: decoded_jwt.userID });
      }


      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Invalid Credentials - User Not Found",
        });
      }

      return res.status(200).send({
        success: true,
        message: "Successfully Logged in",
        user
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
app.use("/admin", require("./routes/AdminRouter"));
app.use("/student", require("./routes/StudentRouter"));

//port
const PORT = process.env.PORT || 8080;

//listen
app.listen(PORT, () => {
  console.log(`Node Server Running In  ModeOn Port ${PORT}`.bgBlue.white);
});
