require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

mongoose.connect(process.env.Mongourl, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("database is connected");
  }
});

const topicmodel = require('./topic.model');




