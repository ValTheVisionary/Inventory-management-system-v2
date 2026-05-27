const prisma = require('../config/prisma');

async function syncLowStockAlerts(){
  const products = await prisma.product.findMany({select:{id:true,name:true,stock:true,reorderThreshold:true}});
  for (const p of products){
    const low = p.stock <= p.reorderThreshold;
    const severity = p.stock===0?'CRITICAL':'WARNING';
    const message = p.stock===0 ? 'Out of stock — immediate restock required' : `Stock below reorder threshold (${p.stock}/${p.reorderThreshold})`;
    const existing = await prisma.alert.findFirst({where:{productId:p.id,dismissedAt:null}});
    if (low && !existing) await prisma.alert.create({data:{productId:p.id,severity,message}});
    if (!low && existing) await prisma.alert.update({where:{id:existing.id},data:{isRead:true,dismissedAt:new Date()}});
  }
}
exports.list = async (_req,res,next)=>{try{await syncLowStockAlerts();const alerts=await prisma.alert.findMany({where:{dismissedAt:null},include:{product:{select:{name:true}}},orderBy:{createdAt:'desc'}});res.json({success:true,data:alerts});}catch(e){next(e)}};
exports.dismiss = async (req,res,next)=>{try{const id=+req.params.id;await prisma.alert.update({where:{id},data:{isRead:true,dismissedAt:new Date()}});res.json({success:true});}catch(e){next(e)}};
