const helpers= require('../helpers/dispatch');
const streamBuffers= require('stream-buffers');
const Buffer= require('buffer');

exports.getDispatchPage= (req,res,next)=>{
    return res.render('dispatch.html');
}

exports.postDispatchPage= async (req,res,next)=>{
    const fechaInicio= req.body.fechaInicio;
    const fechaFin= req.body.fechaFin;
    const mina= req.body.mina;
    const horaInicio= (req.body.horaInicio != null) ? req.body.horaInicio : false;
    const horaFin= (req.body.horaFin != null) ? req.body.horaFin : false;
    //let dispatchBuffer= req.files['dispatch'][0].buffer.toString();
    //let starterBuffer= req.files['starter'][0].buffer.toString();
    let dispatchPath= req.files['dispatch'][0].path;
    let starterPath= req.files['starter'][0].path;

    //Creo un flag para identificar el fin del documento
    //const finDoc= Buffer.Buffer.from('\nFinDocumento');

    //console.log(dispatchBuffer[dispatchBuffer.length]);

    //console.log(finDoc);
    //dispatchBuffer= Buffer.Buffer.concat([dispatchBuffer,finDoc]);
    //starterBuffer= Buffer.Buffer.concat([starterBuffer,finDoc]);

    //Convert the bufferFile to streamReader
    /*const dispatchLog= new streamBuffers.ReadableStreamBuffer({
        frequency: 10,
        chunkSize: 2048
    });
    const starterLog= new streamBuffers.ReadableStreamBuffer({
        frequency: 10,
        chunkSize: 2048
    })

    dispatchLog.put(dispatchBuffer);
    starterLog.put(starterBuffer);
    */

    //console.log(dispatchLog);
    //console.log(starterLog);

    await helpers.generacionReporte(dispatchPath, starterPath, fechaInicio,fechaFin, horaInicio, horaFin);

    return res.send('<h1> Reporte Creado satisfactoriamente</h1>');

}