import express from 'express'; import bcrypt from 'bcryptjs'; import jwt from 'jsonwebtoken'; import Admin from '../models/Admin.js';
const router=express.Router();
router.post('/login',async(req,res,next)=>{try{const {email,password}=req.body;if(!email||!password)return res.status(400).json({message:'Email and password are required'});const admin=await Admin.findOne({email:email.toLowerCase()});if(!admin||!(await bcrypt.compare(password,admin.passwordHash)))return res.status(401).json({message:'Invalid credentials'});const token=jwt.sign({id:admin._id,email:admin.email,role:admin.role},process.env.JWT_SECRET,{expiresIn:'7d'});res.json({token,admin:{id:admin._id,name:admin.name,email:admin.email,role:admin.role}});}catch(e){next(e)}});
export default router;
