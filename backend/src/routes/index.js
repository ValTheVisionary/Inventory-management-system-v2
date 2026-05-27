const router=require('express').Router();
const authC=require('../controllers/authController');
const prod=require('../controllers/productController');
const cat=require('../controllers/categoryController');
const misc=require('../controllers/miscController');
const stock=require('../controllers/stockController');
const users=require('../controllers/userController');
const alerts=require('../controllers/alertController');
const settings=require('../controllers/settingController');
const {auth,permit}=require('../middleware/auth');

router.post('/auth/register',authC.register);
router.post('/auth/login',authC.login);

router.get('/products',auth,prod.list);
router.post('/products',auth,prod.create);
router.put('/products/:id',auth,prod.update);
router.delete('/products/:id',auth,permit('ADMIN','MANAGER'),prod.remove);

router.get('/categories',auth,cat.list);
router.post('/categories',auth,cat.create);
router.put('/categories/:id',auth,cat.update);
router.delete('/categories/:id',auth,permit('ADMIN','MANAGER'),cat.remove);

router.get('/users/me',auth,users.me);
router.patch('/users/me',auth,users.updateMe);
router.get('/users',auth,permit('ADMIN','MANAGER'),users.list);
router.post('/users',auth,permit('ADMIN'),users.create);
router.put('/users/:id',auth,permit('ADMIN','MANAGER'),users.update);
router.delete('/users/:id',auth,permit('ADMIN'),users.remove);

router.get('/alerts',auth,alerts.list);
router.patch('/alerts/:id/dismiss',auth,alerts.dismiss);

router.get('/settings',auth,settings.list);
router.put('/settings/:section',auth,permit('ADMIN','MANAGER'),settings.saveSection);

router.get('/dashboard',auth,misc.dashboard);
router.post('/stock/adjust',auth,stock.adjust);
module.exports=router;
