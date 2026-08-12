import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,default:'Administrator'},email:{type:String,unique:true,lowercase:true,trim:true},passwordHash:String,role:{type:String,default:'admin'},createdAt:{type:Date,default:Date.now}},{timestamps:true});
export default mongoose.model('Admin',schema);
