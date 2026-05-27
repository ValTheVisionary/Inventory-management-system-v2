const prisma = require('../config/prisma');
exports.list = async (_req,res,next)=>{try{const rows=await prisma.setting.findMany({orderBy:{section:'asc'}});const data={};rows.forEach(r=>data[r.section]=r.payload);res.json({success:true,data});}catch(e){next(e)}};
exports.saveSection = async (req,res,next)=>{try{const section=req.params.section;const payload=req.body||{};const row=await prisma.setting.upsert({where:{section},create:{section,payload,updatedById:req.user?.id},update:{payload,updatedById:req.user?.id}});res.json({success:true,data:row});}catch(e){next(e)}};
