import express from 'express'; import Setting from '../models/Setting.js'; import {protect} from '../middleware/auth.js';
const router=express.Router();
async function getGroup(group,keys){const q={group};if(keys)q.key={$in:keys.split(',').map(x=>x.trim()).filter(Boolean)};const docs=await Setting.find(q);return Object.fromEntries(docs.map(d=>[d.key,d.value]));}
router.get('/website',async(req,res,next)=>{try{res.json({data:await getGroup('website',req.query.keys)});}catch(e){next(e)}});
router.get('/business',protect,async(req,res,next)=>{try{res.json({data:await getGroup('business')});}catch(e){next(e)}});
router.get('/dashboard',protect,async(req,res,next)=>{try{res.json({data:await getGroup('dashboard')});}catch(e){next(e)}});
async function upsert(group,body){for(const [key,value] of Object.entries(body||{}))await Setting.findOneAndUpdate({group,key},{group,key,value},{upsert:true,new:true,setDefaultsOnInsert:true});return getGroup(group);}
router.put('/website',protect,async(req,res,next)=>{try{res.json({data:await upsert('website',req.body)});}catch(e){next(e)}});
router.put('/business',protect,async(req,res,next)=>{try{res.json({data:await upsert('business',req.body)});}catch(e){next(e)}});
export default router;
