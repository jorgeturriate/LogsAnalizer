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


const provisionController= require('../controllers/provisionController');

router.get('/provision',provisionController.getProvisionPage);

router.post('/provision', upload.single('provision'), provisionController.postProvisionPage);

module.exports= router;