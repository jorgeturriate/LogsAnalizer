const fs= require('fs');

exports.getMaxHourCounter= (req,res,next)=>{
    return res.render('tiempomaximo.html');
};


exports.postMaxHourCounter= (req,res,next)=>{
    const duracionCaida= req.body.duracionCaida;
    const mina= req.body.mina;
    const servicio= req.body.servicio;

    
}