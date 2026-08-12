import express from 'express'; import Enquiry from '../models/Enquiry.js'; import {protect} from '../middleware/auth.js'; import {sendEnquiryEmails} from '../utils/mailer.js';
const router=express.Router();
router.post('/',async(req,res,next)=>{try{const {name,email,phone,subject,message,formType='contact',property,website}=req.body;if(website)return res.status(400).json({message:'Invalid submission'});if(!name||!email||!phone||!message)return res.status(400).json({message:'Name, email, phone and message are required'});const data=await Enquiry.create({name,email,phone,subject,message,formType,property});const mail=await sendEnquiryEmails(data);res.status(201).json({message:'Enquiry received',data:{id:data._id},mail});}catch(e){next(e)}});
router.get('/',protect,async(req,res,next)=>{try{const {limit=20,status}=req.query;const q=status?{status}:{};const data=await Enquiry.find(q).sort({createdAt:-1}).limit(Math.min(100,Number(limit)));res.json({data});}catch(e){next(e)}});
router.put('/:id',protect,async(req,res,next)=>{try{const data=await Enquiry.findByIdAndUpdate(req.params.id,req.body,{new:true});res.json({data});}catch(e){next(e)}});
router.delete('/:id',protect,async(req,res,next)=>{try{await Enquiry.findByIdAndDelete(req.params.id);res.json({message:'Deleted'});}catch(e){next(e)}});
export default router;
