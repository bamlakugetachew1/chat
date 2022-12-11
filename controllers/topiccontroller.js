require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const topicmodel = mongoose.model("topicschema");
const router = express.Router();

router.get("/allgroups", async (req, res) => {
  topicmodel
    .find()
    .sort({ createdAt: -1 })
    .then((response) => {
      res.json({
        data: response,
      });
    })
    .catch((error) => {
      res.send(error);
    });
});

router.post(
  "/getmembers/:topcname/:membername/:communications",
  async (req, res) => {
    const ifound = await topicmodel.findOne({ topicname: req.params.topcname });
    if (ifound != null) {
      await topicmodel
        .findOneAndUpdate(
          { topicname: req.params.topcname },
          {
            $push: { members: req.params.membername },
          },
          { new: true }
        )
        .then((response) => {
          res.json({
            data: response,
          });
        })
        .catch((error) => {
          res.json({
            status: error,
            message: "something wrong please try again!",
          });
        });
    } else {
      const topic = new topicmodel({
        topicname: req.params.topcname,
        members: req.params.membername,
        language: req.params.communications,
        owner: req.params.membername,
      });
      await topic
        .save()
        .then((response) => {
          res.json({
            data: response,
          });
        })
        .catch((error) => {
          res.json({
            status: error,
            message: "something wrong please try again!",
          });
        });
    }
  }
);

module.exports = router;
