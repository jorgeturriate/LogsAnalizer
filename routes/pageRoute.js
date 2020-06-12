const express= require('express');
const router= express.Router();

const pageController= require('../controllers/pageController');

router.get('/tiempomaximo', pageController.getMaxHourCounter);

router.post('/tiempomaximo', pageController.postMaxHourCounter);

module.exports= router;