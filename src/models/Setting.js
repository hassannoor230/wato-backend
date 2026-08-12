import mongoose from 'mongoose';
const schema=new mongoose.Schema({group:{type:String,required:true,index:true},key:{type:String,required:true},value:{type:mongoose.Schema.Types.Mixed},label:String},{timestamps:true});
schema.index({group:1,key:1},{unique:true});
export default mongoose.model('Setting',schema);
