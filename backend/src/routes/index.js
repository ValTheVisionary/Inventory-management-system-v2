const router=require('express').Router();
const authC=require('../controllers/authController');const prod=require('../controllers/productController');const cat=require('../controllers/categoryController');const misc=require('../controllers/miscController');const stock=require('../controllers/stockController');
const {auth,permit}=require('../middleware/auth');
router.post('/auth/register',authC.register); router.post('/auth/login',authC.login);
router.get('/products',auth,prod.list); router.post('/products',auth,prod.create); router.put('/products/:id',auth,prod.update); router.delete('/products/:id',auth,permit('ADMIN','MANAGER'),prod.remove);
router.get('/categories',auth,cat.list); router.post('/categories',auth,cat.create); router.put('/categories/:id',auth,cat.update); router.delete('/categories/:id',auth,permit('ADMIN','MANAGER'),cat.remove); router.get('/users',auth,permit('ADMIN','MANAGER'),misc.users); router.get('/dashboard',auth,misc.dashboard); router.post('/stock/adjust',auth,stock.adjust);
module.exports=router;
