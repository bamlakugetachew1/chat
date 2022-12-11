const mongoose = require("mongoose");
const topicschema = new mongoose.Schema({
         topicname:{
            type:String,
            require:true
          },
          members:{
            type:Array,
            default:[]
         },
         language:{
             type:String
         },
         owner:{
             type:String
         }

},  { timestamps: true }
)

  mongoose.model("topicschema",topicschema);
