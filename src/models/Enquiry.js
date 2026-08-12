import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:String,email:String,phone:String,subject:String,message:String,formType:{type:String,default:'contact'},property:{type:Object,default:null},status:{type:String,enum:['new','contacted','closed'],default:'new'},notes:String},{timestamps:true});
export default mongoose.model('Enquiry',schema);
