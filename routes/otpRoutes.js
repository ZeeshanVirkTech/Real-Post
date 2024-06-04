const express = require("express");

const auth = require("../middlewares/auth-mw");
const { sendEmailOtp, verifyOtp } = require("../controllers/otpController");

const router = express.Router();

/**
     * @openapi
     * '/api/otp/send':
     *   post:
     *     tags:
     *     - Reset password Controllers
     *     summary: Send otp to email for password reset
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *            schema:
     *              type: object
     *              required:
     *                - email
     *              properties:
     *                 email:
     *                   type: string
     *                   default: johndoe@gmail.com
     *     responses:
     *        201:
     *          description : 
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                required:
     *                 - message
     *                properties:
     *                  message:
     *                    type : string
     *                    default: email sent sucessfully
     *        400:
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
     *        500:
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
router.post("/send", sendEmailOtp);

/**
     * @openapi
     * '/api/otp/verify':
     *   post:
     *     tags:
     *     - Reset password Controllers
     *     summary: Verify otp for password reset
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *            schema:
     *              type: object
     *              required:
     *                - sentOtp
     *                - email
     *              properties:
     *                 sentOtp:
     *                   type: string
     *                   default: this is otp
     *                 email:
     *                   type: string
     *                   default: johndoe@gmail.com
     *     responses:
     *        201:
     *          description : 
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                required:
     *                 - message
     *                properties:
     *                  message:
     *                    type : string
     *                    default: otp verified , taking you to password change screen
     *                  id:
     *                    type: string
     *                    default: this is user's id
     *        400:
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
     *                       default: Incorrect OTP / No such user exists
     *        500:
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
router.post("/verify", verifyOtp);

module.exports = router;
