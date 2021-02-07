const express= require('express');
const router= express.Router();
const multer= require('multer');

//Multer Storage
//const storage= multer.memoryStorage();
const storage= multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, 'uploads');
    },
    filename: (req,file,cb)=>{
        cb(null,file.originalname);
    }
})


const upload= multer({storage: storage});


const dispatchController= require('../controllers/dispatchController');

//Rutas para Dispatch 6

router.get('/dispatch',dispatchController.getDispatchPage);

router.post('/dispatch', 
            upload.fields([
                {name: 'dispatch', maxCount: 1},
                {name: 'starter', maxCount:1}
            ]), 
            dispatchController.postDispatchPage);

// Rutas para Dispatch 5

router.get('/dispatch5',dispatchController.getDispatch5Page);

router.post('/dispatch5', upload.single('dispatch5'), dispatchController.postDispatch5Page);

module.exports= router;