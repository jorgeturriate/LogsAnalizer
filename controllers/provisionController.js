const helpers= require('../helpers/provision');
const fs= require('fs');

exports.getProvisionPage= (req,res,next)=>{
    return res.render('provision.html');
}

exports.postProvisionPage= async (req,res,next)=>{
    const fechaInicio= req.body.fechaInicio;
    const fechaFin= req.body.fechaFin;
    const mina= req.body.mina;
    const horaInicio= (req.body.horaInicio != null) ? req.body.horaInicio : false;
    const horaFin= (req.body.horaFin != null) ? req.body.horaFin : false;
    const provisionPath= req.file.path;

    await helpers.generacionReporte(provisionPath, fechaInicio,fechaFin, horaInicio, horaFin, mina);

    const reportPath= 'uploads/provision'+mina+'.csv';

    fs.stat(reportPath,(err, stats)=>{
        if(err){
            return res.status(500).send('<h1>Ocurrio un error</h1>');
        }

        res.setHeader('Content-Type','text/csv');
        res.setHeader('Content-Disposition','attachment; filename='+reportPath.split('/')[1]);

        fs.createReadStream(reportPath).pipe(res);

        fs.unlink(reportPath,(err)=>{
            if(err) throw(err)
        })
    })

}