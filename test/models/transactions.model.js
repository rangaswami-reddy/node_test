const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {

    userId: {
      type:String,
      required: true 
    },

    name:{
      type:String,
      required:true
    },
    
    paid:{
      type:Number,
      required:true,
      default:0
    },

    received:{
      type:Number,
      required:true,
      default:0
    },

    payable:{
      type:Number,
      required:true,
      default:0
    },

    receivable:{
      type:Number,
      required:true,
      default:0
    },

  },{
    timestamps:true
  }
  );
module.exports = mongoose.model("Transactions", schema);