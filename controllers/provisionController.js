const helpers= require('../helpers/provision');
const fs= require('fs');

exports.getProvisionPage= (req,res,next)=>{

    const date= new Date();

    //Logica para pasar por default el inicio y fin del analisis
    const dia= date.getDate();
    const mes= date.getMonth();
    const year= date.getFullYear();
    let mesStart;
    let finalDate;

    if(mes==0 && dia<=8){
        mesStart= "12";
    }else if(mes!=0 && dia<=8){
        mesStart=(mes-1<=8)?"0"+(mes):(mes);
    }else {
        mesStart= (mes<=8)?"0"+(mes+1):(mes+1);
    }

    const logdatestart= ((mes==0 && dia<=8)?year-1:year) + "-"+ mesStart +"-01";

    finalDate= new Date((mes==0 && dia<=8)?year-1:year, parseInt(mesStart),0);
    const logdatefinal= finalDate.getFullYear() + "-"+((finalDate.getMonth()<=8)?"0"+(finalDate.getMonth()+1):(finalDate.getMonth()+1))+"-"+finalDate.getDate();
    
    return res.render('provision',{
        logstart: logdatestart,
        logfinal: logdatefinal
    });
}

exports.postProvisionPage= async (req,res,next)=>{
    try{
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

    }catch(err){
        next(err);
    }

}