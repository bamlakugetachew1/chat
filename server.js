require("dotenv").config();
const application = require("express")();
const cors = require("cors");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
application.use(cors());
const server = require("http").createServer(application);
const io = require("socket.io")(server, { cors: { origin: "*" } });
var moment = require("moment");
const { response } = require("express");
const PORT = process.env.PORT || 3000;
var time = " ";
var elements = [];
application.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.Mongourl);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

connectDB().then(() => {
  // app.listen(process.env.PORT || 5000, () => {
  // console.log("app listing on port 3000 if port 5000 is free");
  // });

  server.listen(PORT,  () => {
    removeallgroups();
    console.log("Server is running on port: " + PORT);
  });
})













const db_connecion = require("./models/connection");
const topicroutes = require("./controllers/topiccontroller");
const topicmodel = mongoose.model("topicschema");
application.use("/topic", topicroutes);



async function removeallgroups(){
  await topicmodel.find().then( async (response)=>{
     
    for(let i=0; i<response.length; i++){
       await topicmodel.findByIdAndDelete(response[i]._id);   
    }
  }).catch((error)=>{
     console.log(error);
   })
}


async function removefreegroups(){
   
   await topicmodel.find().then( async (response)=>{
     
    for(let i=0; i<response.length; i++){
          if(response[i].members.length < 2){
            await topicmodel.findByIdAndDelete(response[i]._id);
          } 
    }
  }).catch((error)=>{
     console.log(error);
   })
}


setInterval(removefreegroups,300000);






async function removeuser(topicname, username) {
  let index = "";
  const ifound = await topicmodel.findOne({ topicname: topicname });
  if (ifound != null) {
    elements = ifound.members;
    for (let i = 0; i < elements.length; i++) {
      if (elements[i] == username) {
        index = i;
        elements.splice(i, 1);
        break;
      }
    }
  }

  await topicmodel
    .findOneAndUpdate(
      { topicname: topicname },
      {
        $set: { members: elements },
      },
      { new: true }
    )
    .then((response) => {
      io.to(topicname).emit("sendnumber", {
        index: index,
        size: response.members.length,
        data: response.members,
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

io.on("connection", (socket) => {
  socket.on("joingroup", (info) => {
    time = moment().format("h:mm:ss a");
    socket.username = info.username;
    socket.groupname = info.groupname;
    socket.join(socket.groupname);
    socket.emit("wellcome", {
      msg: `${socket.username} well come to ${socket.groupname} group`,
      time: time,
      groupname: socket.groupname,
      username: socket.username,
    });
    
    socket.broadcast.to(socket.groupname).emit("notifymembers", {
      msg: `${socket.username} joined`,
      time: time,
      groupname: socket.groupname,
      username: socket.username,
    });
  });

  socket.on("disconnect", async() => {
    time = moment().format("h:mm:ss a");
   await socket.broadcast.to(socket.groupname).emit("notifyuserleave", {
      msg: `${socket.username} leave group`,
      time: time,
      groupname: socket.groupname,
      username: socket.username,
    });
    removeuser(socket.groupname, socket.username);
    socket.leave(socket.username);
  });
  
  socket.on("attemptstoreconnects", async(msg) => {
       removeuser(msg.topicname, msg.username);
  });


  



  

  socket.on("new message", (msg) => {
    time = moment().format("h:mm:ss a");
    io.to(socket.groupname).emit("send message", {
      msg: msg,
      time: time,
      sender: socket.username,
    });
  });

  socket.on("groupmem", async (msg) => {
    const ifound = await topicmodel.findOne({ topicname: socket.groupname });
    var length = 0;
    if (ifound !== null) {
      length = ifound.members.length;
    }
    io.to(socket.groupname).emit("sendnumber", {
      msg: msg.lengthof,
      size: length,
      data: msg.data,
    });
  });

  socket.on("terminate", () => {
    time = moment().format("h:mm:ss a");

    io.sockets.sockets.get(socket.id).leave(socket.groupname);
    removeuser(socket.groupname, socket.username);
    socket.broadcast.to(socket.groupname).emit("notifyuserleave", {
      msg: `${socket.username} leave group`,
      time: time,
      groupname: socket.groupname,
      username: socket.username,
    });
  });
});
