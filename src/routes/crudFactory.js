export function makeCrud(Model,{sort={createdAt:-1},publicFilter={active:true}}={}){
 return {
  list:async(req,res,next)=>{try{const filter=req.isAdmin?{}:publicFilter;const data=await Model.find(filter).sort(sort);res.json({data});}catch(e){next(e)}},
  create:async(req,res,next)=>{try{const data=await Model.create(req.body);res.status(201).json({data});}catch(e){next(e)}},
  update:async(req,res,next)=>{try{const data=await Model.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!data)return res.status(404).json({message:'Not found'});res.json({data});}catch(e){next(e)}},
  remove:async(req,res,next)=>{try{await Model.findByIdAndDelete(req.params.id);res.json({message:'Deleted'});}catch(e){next(e)}}
 };
}
