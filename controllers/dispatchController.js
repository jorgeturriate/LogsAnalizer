const helpers= require('../helpers/dispatch');
const fs= require('fs');

exports.getDispatchPage= (req,res,next)=>{
    return res.render('dispatch.html');
}

exports.postDispatchPage= async (req,res,next)=>{
    const fechaInicio= req.body.fechaInicio;
    const fechaFin= req.body.fechaFin;
    const mina= req.body.mina;
    const horaInicio= (req.body.horaInicio != null) ? req.body.horaInicio : false;
    const horaFin= (req.body.horaFin != null) ? req.body.horaFin : false;
    const dispatchPath= req.files['dispatch'][0].path;
    const starterPath= req.files['starter'][0].path;

    await helpers.generacionReporte(dispatchPath, starterPath, fechaInicio,fechaFin, horaInicio, horaFin, mina);

    const reportPath= 'uploads/dispatch'+mina+'.csv';

    fs.exists(reportPath,(exists)=>{
        if(!exists){
            return res.status(500).send('<h1>Ocurrio un error</h1>');
        }

        res.setHeader('Content-Type','text/csv');
        res.setHeader('Content-Disposition','attachment; filename='+reportPath.split('/')[1]);

        fs.createReadStream(reportPath).pipe(res);
    })

    //return res.send('<h1> Reporte Creado satisfactoriamente</h1>');

}