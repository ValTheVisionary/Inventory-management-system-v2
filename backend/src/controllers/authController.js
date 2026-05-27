const service = require('../services/authService');
const HttpError = require('../utils/httpError');
const emailOk = (e)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
exports.register = async (req,res,next)=>{try{const {name,email,password,role}=req.body;if(!name||!email||!password) throw new HttpError(400,'name, email, password are required');if(!emailOk(email)) throw new HttpError(400,'Invalid email');if(password.length<8) throw new HttpError(400,'Password must be at least 8 characters');res.status(201).json({success:true,data:await service.register({name,email,password,role})});}catch(e){next(e)}};
exports.login = async (req,res,next)=>{try{const {email,password}=req.body;if(!email||!password) throw new HttpError(400,'email and password are required');res.json({success:true,data:await service.login(email,password)});}catch(e){next(e)}};
