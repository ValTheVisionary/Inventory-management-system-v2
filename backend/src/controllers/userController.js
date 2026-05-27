const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const HttpError = require('../utils/httpError');

const roleMap = { Administrator: 'ADMIN', Manager: 'MANAGER', Viewer: 'STAFF', ADMIN: 'ADMIN', MANAGER: 'MANAGER', STAFF: 'STAFF' };
const statusMap = { Active: 'ACTIVE', Inactive: 'INACTIVE', ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' };

exports.list = async (_req,res,next)=>{try{const users=await prisma.user.findMany({select:{id:true,name:true,email:true,role:true,status:true,createdAt:true},orderBy:{id:'asc'}});res.json({success:true,data:users});}catch(e){next(e)}};
exports.create = async (req,res,next)=>{try{const {name,email,password='ChangeMe123!',role='STAFF',status='ACTIVE'}=req.body;if(!name||!email) throw new HttpError(400,'name and email required');const hash=await bcrypt.hash(password,10);const user=await prisma.user.create({data:{name,email,passwordHash:hash,role:roleMap[role]||'STAFF',status:statusMap[status]||'ACTIVE'},select:{id:true,name:true,email:true,role:true,status:true,createdAt:true}});res.status(201).json({success:true,data:user});}catch(e){next(e)}};
exports.update = async (req,res,next)=>{try{const id=+req.params.id;const {name,email,role,status}=req.body;const data={};if(name) data.name=name;if(email) data.email=email;if(role) data.role=roleMap[role]||role;if(status) data.status=statusMap[status]||status;const user=await prisma.user.update({where:{id},data,select:{id:true,name:true,email:true,role:true,status:true,createdAt:true}});res.json({success:true,data:user});}catch(e){next(e)}};
exports.remove = async (req,res,next)=>{try{await prisma.user.delete({where:{id:+req.params.id}});res.json({success:true});}catch(e){next(e)}};
