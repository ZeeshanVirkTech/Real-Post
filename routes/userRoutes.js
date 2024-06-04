const express = require("express");
const { check } = require("express-validator");
const auth = require("../middlewares/auth-mw");



const { updateInfo, login, signup, setNewPassword, uploadPFP, getMyNotifications, deleteANotification } = require("../controllers/userController");
const {
  signUpValidation,
  loginValidation,
  editUserValidation,
  editPasswordValidation,
} = require("../utils/fieldsValidation");
const { uploadImage } = require("../uploader/imageUploader");
const router = express.Router();

   /**
     * @openapi
     * '/api/users/signup':
     *  post:
     *     tags:
     *     - User Controllers
     *     summary: Create a user
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - username
     *              - email
     *              - password
     *            properties:
     *              username:
     *                type: string
     *                default: johndoe 
     *              email:
     *                type: string
     *                default: johndoe@gmail.com
     *              password:
     *                type: string
     *                default: johnDoe20
     *     responses:
     *      201:
     *        description:
     *        content:
     *          application/json:
     *            schema:
     *             type: object
     *             required:
     *             - message
     *             properties:
     *               message:
     *                 type: string
     *                 default: User created successfully
     *      409:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: Username already exists / user with this email already exists
     *      500:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: Something went wrong
     */

router.post("/signup", signUpValidation(), signup);
   /**
     * @openapi
     * '/api/users/login':
     *  post:
     *     tags:
     *     - User Controllers
     *     summary: Login existing user
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - username
     *              - email
     *              - password
     *            properties:
     *              email:
     *                type: string
     *                default: johndoe@gmail.com
     *              password:
     *                type: string
     *                default: johnDoe20
     *     responses:
     *      201:
     *        description: OK
     *        content :
     *          application/json:
     *             schema :
     *              type : object
     *              required:
     *               - token
     *               - username
     *               - email
     *               - userId
     *               - message
     *              properties :
     *               token :
     *                 type :  string
     *                 default : eyj......
     *               username :
     *                 type : string
     *                 default : huzaifaaa
     *               email:
     *                 type : string
     *                 default : huzaifaaa@gmail.com
     *               userId :
     *                 type : string
     *                 default : ........
     *               message : 
     *                 type : string
     *                 default : Login success , welcome
     *      400:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: No such user exists / password is wrong
     *      500:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: Something went wrong
     */

router.post("/login", loginValidation(), login);

   /**
     * @openapi
     * /api/users/edit/{userid}:
     *  patch:
     *     parameters:
     *       - in: path
     *         name: userid
     *         required: true
     *         type: string
     *         minimum: 1
     *         description: user's id
     *     tags:
     *     - User Controllers
     *     summary: Edit user credentials (username , email)
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - username
     *              - email
     *            properties:
     *              username:
     *                type: string
     *                default: huzaifa
     *              email:
     *                type: string
     *                default: huzaifa@gmail.com
     *     responses:
     *      201:
     *        description:
     *        content:
     *          application/json:
     *             schema:
     *              type: object
     *              required:
     *               - message
     *              properties:
     *                username:
     *                  type: string
     *                  default: huzaifa
     *                email:
     *                   type: string
     *                   default: huzaifa@gmail.com
     *                message:
     *                  type :  string
     *                  default : Successfully updated your info
     *      400:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: No such user exists
     *      403:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: Unauthorized user access
     *      500:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: Something went wrong
     */

router.patch("/edit/:userid", editUserValidation(), auth, updateInfo);

   /**
     * @openapi
     * '/api/users/password/edit':
     *  patch:
     *     tags:
     *     - User Controllers
     *     summary: Set new password after otp is verified
     *     requestBody:
     *      required: true
     *      description : This api should only be accessible after otp has been verified.
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - password
     *              - userId
     *            properties:
     *              password:
     *                type: string
     *                default: password
     *              userId:
     *                 type: string
     *                 default: this is user's id
     *     responses:
     *      201:
     *        description:
     *        content:
     *          application/json:
     *             schema:
     *              type: object
     *              required:
     *               - message
     *              properties:
     *                message:
     *                  type:  string
     *                  default: Password updated successfully!
     *      400:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: No such user exists
     *      500:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: Something went wrong
     */
router.patch("/password/edit" , editPasswordValidation(), setNewPassword);
router.post("/upload/pfp" , auth , uploadImage , uploadPFP );

router.get("/notifications/get" , auth , getMyNotifications);
router.delete("/notifications/delete" , auth , deleteANotification);

module.exports = router;
