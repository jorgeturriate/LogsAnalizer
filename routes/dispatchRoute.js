const express= require('express');
const router= express.Router();
const multer= require('multer');

//Multer Storage
//const storage= multer.memoryStorage();
const storage= multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, 'uploads');
    }
})


const upload= multer({storage: storage});


const dispatchController= require('../controllers/dispatchController');

router.get('/dispatch',dispatchController.getDispatchPage);

router.post('/dispatch', 
            upload.fields([
                {name: 'dispatch', maxCount: 1},
                {name: 'starter', maxCount:1}
            ]), 
            dispatchController.postDispatchPage);

module.exports= router;