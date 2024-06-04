const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const mongoConnect = require("./utils/mongoConnection");
const RouteNotFound = require("./utils/NoRouteFoundMW");
const app = express();
const cron = require("node-cron");
const user_model = require("./model/user");

app.use(express.json());
app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(cors());

const userRoute = require("./routes/userRoutes");
const otpRoute = require("./routes/otpRoutes");
const personaRoute = require("./routes/personaRoutes");
const postRoute = require("./routes/postRoutes");
const errorHandler = require("./utils/errorHandlerMW");
const helperAPI = require("./utils/helperApi");
const swaggerDocs = require("./services/swagger");
const { initializeFirebase, sendPushNotification } = require("./services/firebase");


app.use("/helper", helperAPI);
app.use("/api/users", userRoute);
app.use("/api/otp", otpRoute);
app.use("/api/persona", personaRoute);
app.use("/api/post", postRoute);


swaggerDocs(app);


RouteNotFound(app);
errorHandler(app);

try {
  mongoConnect();
  initializeFirebase();

  let title= 'Reminder';
  let body = "Hey there, it's time to check in!";

const cronJob = async (req, res, next) => {
  try {
    const users = await user_model.find({ reminder_type:"daily" }).exec();

    for (const user of users) {
        if(user.device_token!=="none")
        {
          await sendPushNotification(title , body ,user.device_token);
          user.notifications.push({title : title , body : body});
          await user.save();
        }

    }
  } catch (error) {
    return next(error.message);
  }
};

const cronJob2 = async (req, res, next) => {
  try {
    const users = await user_model.find({ reminder_type:"weekly" }).exec();

    for (const user of users) {
        if(user.device_token!=="none")
        {
          await sendPushNotification(title , body ,user.device_token);
          user.notifications.push({title : title , body : body});
          await user.save();
        
        }
    }
  } catch (error) {
    return next(error.message);
  }
};

const cronJob3 = async (req, res, next) => {
  try {
    const users = await user_model.find({ reminder_type:"twice-a-week" }).exec();

    for (const user of users) {
        if(user.device_token!=="none")
        {
          await sendPushNotification(title , body ,user.device_token);
          user.notifications.push({title : title , body : body});
          await user.save();
         
        }
    }
  } catch (error) {
    return next(error.message);
  }
};

// cron jobs for reminder notifications
cron.schedule('20 21 * * *', cronJob);
cron.schedule('15 13 * * 1', cronJob2);
cron.schedule('36 14 * * 2,5', cronJob3);
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server  is on ${PORT}`));
} catch (error) {
  console.log(error);
}
