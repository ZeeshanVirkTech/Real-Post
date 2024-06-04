const USER = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
require("dotenv").config();
const fs = require("fs");
const otp_model=require("../model/otp");

const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.code = 400;
    return next(error);
  }

  let alreadyExists;
  try {
    alreadyExists = await USER.findOne({ email: email.toLowerCase() });
  } catch (err) {
    const error = new Error("Error connecting to server");
    error.code = 500;
    return next(error);
  }

  if (alreadyExists) {
    const error = new Error("User with this email already exists");
    error.code = 409;
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 5);

  let newUser;
  try {
    newUser = new USER({
      email: email.toLowerCase(),
      username: username,
      password: hashedPassword,
    });
    await newUser.save();
  } catch (err) {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
  }

  let token;

  try {
    token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
      process.env.JWT_KEY,
      {}
    );
  } catch (err) {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
  }

  res.status(200);
  res.json({
    token: token,
    username: newUser.username,
    userId: newUser.id,
    email: newUser.email,
    profile_pic : newUser.profile_pic,
    message: "User created , you can log in to continue"
  });
};

const login = async (req, res, next) => {
  const { email, password, role } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.code = 400;
    return next(error);
  }

  let emailExists;
  try {
    emailExists = await USER.findOne({ email: email.toLowerCase() });
  } catch (err) {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
  }

  if (!emailExists) {
    const error = new Error("No such user exists");
    error.code = 400;
    return next(error);
  }

  let comparePassword;
  try {
    comparePassword = await bcrypt.compare(password, emailExists.password);
  } catch (err) {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
  }

  if (comparePassword !== true) {
    const error = new Error("Password is wrong");
    error.code = 400;
    return next(error);
  }
  let token;

  try {
    token = jwt.sign(
      {
        userId: emailExists.id,
        email: emailExists.email,
        username: emailExists.username,
      },
      process.env.JWT_KEY,
      {}
    );
  } catch (err) {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
  }

  res.status(200);
  res.json({
    token: token,
    username: emailExists.username,
    userId: emailExists.id,
    email: email,
    profile_pic : emailExists.profile_pic,
    reminder_type : emailExists.reminder_type,
    message: "LOGIN SUCCESS , WELCOME !",
  });
};

const updateInfo = async (req, res, next) => {
  const { username, email } = req.body;
  const paramsUserId = req.params.userid;
  const userId = req.extractedUserId;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.code = 400;
    return next(error);
  }

  let user;
  try {
    user = await USER.findById(userId);
  } catch {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
  }

  if (!user?.email) {
    const error = new Error("No such user exists");
    error.code = 400;
    return next(error);
  }

  if(userId!==paramsUserId)
  {
    const error = new Error("Unauthorized user access");
    error.code = 403;
    return next(error);
  }

  user.email = email.toLowerCase();
  user.username = username;


  let emailExists;
  try {
    emailExists = await USER.findOne({email : email.toLowerCase()});
  } catch {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
  }

  if(emailExists?.email && emailExists?.email.toString()!==req.extractedEmail)
  {
    const error = new Error("Email already exists , choose a new one");
    error.code = 409;
    return next(error);
  }

  try {
         await user.save();
  } catch  {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
  }

  res.status(201).json({ message: "Successfully updated your info" , username: user.username , email : user.email });
};

const setNewPassword=async(req , res ,next)=>{
   const{ password , userId} = req.body;

   const errors = validationResult(req);

   if (!errors.isEmpty()) {
     const error = new Error(errors.array()[0].msg);
     error.code = 400;
     return next(error);
   }
   
   let user;
   try {
       user = await USER.findById(userId);
   } catch  {
    const error = new Error("Error updating info");
    error.code = 500;
    return next(error);
   }
    

   if(!user?.email)
   {
    const error = new Error("No such user exists");
    error.code = 400;
    return next(error);
   }

   let otpp;
   try {
    const hashedPassword = await bcrypt.hash(password, 5);
        user.password=  hashedPassword;
          otpp = await otp_model.deleteMany({email : user?.email?.toString()});
   } catch  {
    const error = new Error("Error updating info");
    error.code = 500;
    return next(error);
   }
    
      try {
        await user.save();
      } catch (err) {
        const error = new Error(err);
        error.code = 500;
        return next(error);
      }

   res.status(201).json({message :"Password updated successfully!"});
}

const uploadPFP=async(req ,res , next)=>{
  const imageUrl = req.file;
  
  let user;
  try {
           user = await USER.findById(req.extractedUserId);
  } catch {
      const error = new Error("Something went wrong");
      error.code = 500;
      return next(error);
  }

  if(!user?.username)
  {
      const error = new Error("No such user exists");
      error.code = 403;
      return next(error);
  }
  
  try {
       user.profile_pic = imageUrl;
       await user.save();
  } catch  {
   const error = new Error("Something went wrong");
   error.code = 500;
   return next(error);
  }

  res.status(201).json({imageUrl : imageUrl});
};

const getMyNotifications=async(req , res ,next)=>{
  let user;
  try {
           user = await USER.findById(req.extractedUserId);
  } catch {
      const error = new Error("Something went wrong");
      error.code = 500;
      return next(error);
  }

  if(!user?.username)
  {
      const error = new Error("No such user exists");
      error.code = 403;
      return next(error);
  }

  res.status(200).json({notifications : user.notifications});
};

const deleteANotification=async(req, res ,next)=>{
    const {notificationId} = req.body;
  let user;
  try {
           user = await USER.findById(req.extractedUserId);
  } catch {
      const error = new Error("Something went wrong");
      error.code = 500;
      return next(error);
  }

  if(!user?.username)
  {
      const error = new Error("No such user exists");
      error.code = 400;
      return next(error);
  }

      let notificationIndex = user.notifications.findIndex((n)=>n._id.toString()===notificationId);
      if(notificationIndex===-1)
      {
        const error = new Error("No such notification exist for this user");
        error.code = 400;
        return next(error);
    }


    try {
           user.notifications.splice(notificationIndex , 1);
           await user.save();
    } catch (err) {
      const error = new Error(err);
      error.code = 500;
      return next(error);
    }

    res.status(201).json({message : "Notification deleted!"});
      };


exports.signup = signup;
exports.login = login;
exports.updateInfo = updateInfo;
exports.setNewPassword = setNewPassword;
exports.uploadPFP = uploadPFP;
exports.getMyNotifications = getMyNotifications;
exports.deleteANotification =  deleteANotification;