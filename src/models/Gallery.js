import mongoose from 'mongoose';
const schema=new mongoose.Schema({title:String,description:String,image:{url:String,publicId:String},category:{type:String,default:'properties'},order:{type:Number,default:0},active:{type:Boolean,default:true}},{timestamps:true});
export default mongoose.model('Gallery',schema);
