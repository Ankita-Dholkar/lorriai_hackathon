import mongoose from "mongoose"

const receiptSchema = new mongoose.Schema({

 driverId:{
  type:String
 },

 amount:{
  type:Number
 },

 date:{
  type:String
 },

 location:{
  type:String
 },

 imageUrl:{
  type:String
 },

 fraud:{
  type:Boolean,
  default:false
 }

})

export default mongoose.model("Receipt", receiptSchema)