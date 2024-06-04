const { check } = require("express-validator");

const signUpValidation=(req ,res , next)=>{
   return [
        check("username").trim().isLength({ min: 1 }).withMessage("Username must not be empty"),
        check("email").trim().isEmail().withMessage("Invalid email format"),
        check("password").trim().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
      ]

};

const loginValidation=(req, res ,next)=>{
   return [
        check("email").trim().isEmail().withMessage("Invalid email format"),
        check("password").trim().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
      ]
};

const editUserValidation=(req , res , next)=>{
   return [
        check("username").trim().trim().isLength({ min: 1 }).withMessage("Username must not be empty"),
        check("email").trim().trim().isEmail().withMessage("Invalid email format"),
      ]

};

const generatePersonaValidation =()=>{
  return [
    check("idealTraits").trim().not().isEmpty().withMessage("Ideal traits cannot be empty"),
    check("name").trim().not().isEmpty().withMessage("name cannot be empty"),
    check("cities").trim().not().isEmpty().withMessage("Cities cannot be empty"),
    check("usp").trim().not().isEmpty().withMessage("USP cannot be empty"),
  ]
};


const editPersonaValidation =()=>{
  return [
    check("name").trim().not().isEmpty().withMessage("Name cannot be empty"),
    check("background").trim().not().isEmpty().withMessage("Background cannot be empty"),
    check("housing_needs").trim().not().isEmpty().withMessage("Housing needs cannot be empty"),
    check("other_requirements").trim().not().isEmpty().withMessage("Other requirements cannot be empty"),
  ]
};

const generatePostValidation =()=>{
  return [
    check("persona.heading").trim().not().isEmpty().withMessage("Headings cannot be empty"),
    check("persona.name").trim().not().isEmpty().withMessage("Name cannot be empty"),
    check("persona.background").trim().not().isEmpty().withMessage("Background cannot be empty"),
    check("persona.housing_needs").trim().not().isEmpty().withMessage("Housing needs cannot be empty"),
    check("persona.other_requirements").trim().not().isEmpty().withMessage("Other requirements cannot be empty"),
    check("tone").isArray({min:1}).withMessage("Tones must be an array and it cannot be empty")
  ]
};

const confirmPostValidation=()=>{
  return [
    check("heading").trim().not().isEmpty().withMessage("Headings cannot be empty") ,
    check("description").trim().not().isEmpty().withMessage("Description cannot be empty") ,
    // check("generatedImages").isArray({min:1}).withMessage("generatedImages must be array and cannot be empty")
  ]
};

const editPasswordValidation=()=>{
  return [
    check("userId").trim().not().isEmpty().withMessage("Invalid userId , must not be empty"),
    check("password").trim().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ]
}



exports.signUpValidation = signUpValidation;
exports.loginValidation = loginValidation;
exports.editUserValidation = editUserValidation;
exports.generatePersonaValidation = generatePersonaValidation;
exports.editPersonaValidation = editPersonaValidation;
exports.generatePostValidation = generatePostValidation;
exports.confirmPostValidation = confirmPostValidation;
exports.editPasswordValidation = editPasswordValidation;