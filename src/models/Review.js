import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:String,role:String,text:String,rating:{type:Number,min:1,max:5,default:5},image:String,active:{type:Boolean,default:true}},{timestamps:true});
export default mongoose.model('Review',schema);
