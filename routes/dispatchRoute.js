const express= require('express');
const router= express.Router();

const dispatchController= require('../controllers/dispatchController');

router.get('/dispatch',dispatchController.getDispatchPage);

router.post('/dispatch',dispatchController.postDispatchPage);

module.exports= router;