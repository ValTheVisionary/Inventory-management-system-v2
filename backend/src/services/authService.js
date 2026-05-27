const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const HttpError = require('../utils/httpError');

const sign = (u)=>jwt.sign({id:u.id,email:u.email,role:u.role}, process.env.JWT_SECRET || 'dev_secret', {expiresIn:'1d'});

async function register(data){
  const exists = await prisma.user.findUnique({where:{email:data.email}}); if(exists) throw new HttpError(409,'Email already in use');
  const passwordHash = await bcrypt.hash(data.password,10);
  const user = await prisma.user.create({data:{name:data.name,email:data.email,passwordHash,role:data.role||'STAFF'}});
  return { token: sign(user), user:{id:user.id,name:user.name,email:user.email,role:user.role,status:user.status} };
}
async function login(email,password){
  const user = await prisma.user.findUnique({where:{email}}); if(!user) throw new HttpError(401,'Invalid credentials');
  const ok = await bcrypt.compare(password,user.passwordHash); if(!ok) throw new HttpError(401,'Invalid credentials');
  return { token: sign(user), user:{id:user.id,name:user.name,email:user.email,role:user.role,status:user.status} };
}
module.exports={register,login};
