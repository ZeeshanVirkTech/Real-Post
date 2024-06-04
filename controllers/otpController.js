const sendEmail = require("../utils/sendEmail");
const user_model = require("../model/user");
const otp_model = require("../model/otp");


const sendEmailOtp = async (req, res, next) => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  const { email } = req.body;
  let data;
  let user;
  try {
    user = await user_model.find({ email: email.toLowerCase() });
  } catch {
    const error = new Error("something went wrong");
    error.code = 500;
    return next(error);
  }

  if (user.length === 0) {
    const error = new Error("No such user exists");
    error.code = 400;
    return next(error);
  }

  try {
     data = await sendEmail(email, "Reset Password", otp.toString());
       await new otp_model({otpCode : otp.toString() ,email : email.toLowerCase() }).save();
      
  } catch  {
    const error = new Error("something went wrong");
    error.code = 500;
    return next(error);
  }

  res.status(data.status).json({ message: data.message });
};

const verifyOtp = async (req, res, next) => {
  const { email, sentOtp } = req.body;

  let userExists;
    try {
          userExists = await user_model.findOne({email :  email.toLowerCase()});
    } catch  {
      const error = new Error("something went wrong");
      error.code = 500;
      return next(error);
    }

    if(!userExists?.email)
    {
      const error = new Error("No such user exists");
      error.code = 400;
      return next(error);
    }

   
  let savedOtp;
  try {
        savedOtp= await otp_model.findOne({otpCode:sentOtp ,email:email.toLowerCase()});
  } catch  {
    const error = new Error("something went wrong");
    error.code = 500;
    return next(error);
  }

  if (sentOtp !== savedOtp?.otpCode?.toString()) {
    const error = new Error("Incorrect otp");
    error.code = 400;
    return next(error);
  } 

  res
  .status(201)
  .json({ message: "otp verified , taking you to password change screen" , id:userExists._id });
};

exports.sendEmailOtp = sendEmailOtp;
exports.verifyOtp = verifyOtp;
