const admin = require("firebase-admin");
var serviceAccount = require("../utils/firebasePrivateKey.json");

const initializeFirebase=()=>{
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      
      console.log("firebase initialized");
};


const sendPushNotification=async(title , body ,device_token)=>{
    const message = {
        notification: {
          title: title,
          body: body
        },
        token: device_token // Replace with the actual device token
      };
      
      try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
      } catch (err) {
        console.log('Error sending notification:', err);
        return {
          error : err
        };
      }
}

module.exports = {initializeFirebase , sendPushNotification};