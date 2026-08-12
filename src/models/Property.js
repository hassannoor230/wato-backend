import mongoose from 'mongoose';
const imageSchema=new mongoose.Schema({url:String,publicId:String,caption:String},{_id:false});
const schema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},slug:{type:String,unique:true,index:true},description:String,shortDescription:String,
 propertyType:{type:String,default:'plot',index:true},listingType:{type:String,default:'sale',index:true},price:{type:Number,default:0},currency:{type:String,default:'PKR'},
 location:String,city:String,area:String,address:String,latitude:Number,longitude:Number,googleMapsUrl:String,
 bedrooms:Number,bathrooms:Number,areaSize:Number,areaUnit:{type:String,default:'marla'},amenities:[String],features:[String],images:[imageSchema],featuredImage:String,
 status:{type:String,enum:['published','draft','sold','rented'],default:'published',index:true},featured:{type:Boolean,default:false,index:true},availability:{type:String,default:'available'},contactPhone:String,seoTitle:String,seoDescription:String
},{timestamps:true});
schema.pre('validate',function(next){if(!this.slug&&this.title)this.slug=this.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+this._id.toString().slice(-6);next();});
export default mongoose.model('Property',schema);
