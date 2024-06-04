const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = (req, res, next) => {
  const sentToken = req.headers.authorization;

  let Token;
  try {
    const token = sentToken?.split("Bearer ")[1];
    Token = jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    const error = new Error(err);
    error.code = 500;
    return next(error);
  }

  console.log("AUTHENTICATED");

  req.extractedUserId = Token.userId;
  req.extractedUsername = Token.username;
  req.extractedEmail = Token.email;

  next();
};

module.exports = auth;
