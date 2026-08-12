import express from 'express'; import {protect} from '../middleware/auth.js'; import {makeCrud} from './crudFactory.js'; import Service from '../models/Service.js'; import Gallery from '../models/Gallery.js'; import Review from '../models/Review.js'; import FAQ from '../models/FAQ.js';
const router=express.Router();
function mount(path,Model,options){const c=makeCrud(Model,options);router.get(path,async(req,res,next)=>{req.isAdmin=false;c.list(req,res,next)});router.get(path+'/admin',protect,async(req,res,next)=>{req.isAdmin=true;c.list(req,res,next)});router.post(path,protect,c.create);router.put(path+'/:id',protect,c.update);router.delete(path+'/:id',protect,c.remove);}
mount('/services',Service,{sort:{order:1,createdAt:-1}});mount('/gallery',Gallery,{sort:{order:1,createdAt:-1}});mount('/reviews',Review,{sort:{createdAt:-1}});mount('/faqs',FAQ,{sort:{order:1,createdAt:-1}});
export default router;
