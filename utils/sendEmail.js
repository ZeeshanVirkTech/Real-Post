const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (email, subject, otp) => {
    try {
        const transporter = nodemailer.createTransport({
           host: process.env.MAILER_HOST,
           port: process.env.MAILER_PORT,
         service : process.env.MAILER_SERVICE,
            auth: {
              // TODO: replace `user` and `pass` values from <https://forwardemail.net>
              user:process.env.MAILER_EMAIL,
              pass: process.env.MAILER_PASSWORD,
            },
            from : process.env.MAILER_EMAIL
          });

        await transporter.sendMail({
            from: process.env.MAILER_EMAIL,
            to: email,
            subject: subject,
            text: otp,
            html : `
            <h2>Please Use this OTP to reset your password</h2>
            <h3><b>${otp}</b></h3>
            `
        });
         const response = {message :"email sent sucessfully" , status:201};
        return response;
    } catch (error) {
        const response = {message :`${error}, "email not sent"`, status:500};
        return response;
        
    }
};

module.exports = sendEmail;