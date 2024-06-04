const user_model = require("../model/user");

const checkUser =async(req , res , next)=>{
    let user;
    try {
             user = await user_model.findById(req.extractedUserId);
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

    next();
  };

  module.exports = checkUser;