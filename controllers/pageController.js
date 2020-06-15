const Caida= require('../models/caidaModel');

exports.getMaxHourCounter= (req,res,next)=>{
    return res.render('tiempomaximo.html');
};


exports.postMaxHourCounter= async (req,res,next)=>{
    const duracionCaida= req.body.duracionCaida;
    const mina= req.body.mina;
    const servicio= req.body.servicio;
   
    //Guardamos la fecha actual en que se hace el registro
    const updated= Date.now;

    const caida= await Caida.getCaida(servicio,mina);
    console.log(caida);
    return res.send(caida);
}