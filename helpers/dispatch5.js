const fs = require('fs');
const readline = require('readline');

exports.generacionReporte= async (transacciones, fechaInicio, fechaFin, horaInicio, horaFin, mina)=>{
    
    console.log('Llegue a script')
    //Path de ubicacion del reporte
    const pathReporte= 'uploads/dispatch5'+mina+'.csv';

    const writeStream= fs.createWriteStream(pathReporte);
    let arrCases;
    let args;

    //Validacion de datos de entrada
    if(!fechaInicio || !fechaFin){
        args=false;
    }

    if(horaInicio && horaFin){
        args= [new Date(fechaInicio+'T'+horaInicio+'Z'), new Date(fechaFin+'T'+horaFin+'Z')];
    }else{
        args= [new Date(fechaInicio+'T00:00:00Z'), new Date(fechaFin+'T'+'T23:59:59Z')];
    }

    console.log('antes de ejecutar el lector de lineas inicial');

    //Leemos las transacciones y hacemos el filtrado para obtener en el array las caidas y running
    arrCases= await leerLog(transacciones, args, mina);

    //console.log(arrCases);

    //Procesamos el array para obtener las caidas
    const {arrayProcesado, segundosTotales}= procesarArray(arrCases);

    writeStream.write(arrayProcesado);
    if(args){
        const rangoFecha= (args[1]-args[0])/1000;
        const porcentajeTotal= ((segundosTotales)/rangoFecha)*100;
        writeStream.write('\nSegundos Totales,'+segundosTotales+',Rango de fecha en segundos,'+rangoFecha+',Porcentaje Total,'+porcentajeTotal);
        writeStream.write('\n\nReporte realizado del '+args[0]+' al '+args[1]);

    }

    //Borro los logs
    fs.unlink(transacciones,(err)=>{
        if (err) throw(err);
        console.log('Borrado el log de provision');
    })

    writeStream.end();
    console.log('Script terminado');

}

const leerLog= async (filePath, periodo, mina)=>{

    //Identificamos el mensaje de caida
    const mensaje= (mina==='Antamina')?'Volviendo':'';

    const streamer= fs.createReadStream(filePath);

    
    const rd= readline.createInterface({
        //input: readerStreamStarter,
        input: streamer,
        console: false
    })
    
    
    return new Promise(resolve=>{
        
        const arrCases= [];
        
        console.log('Dentro de la primera promesa');

        streamer.on('error', _ => resolve(null));


        rd.on('line', function(line) {
            if(line.toString().includes(mensaje) || line.toString().includes('transact:***') || line.length>=98){
                const yearString='20'+line.slice(2,4);
                const mesString= line.slice(4,6);
                const diaString= line.slice(6,8);
                const horaString= line.slice(line.length - 8, line.length);
                const date= new Date(yearString+'-'+mesString+'-'+diaString+'T'+horaString+'Z');

                if(periodo && date.getTime()>= periodo[0].getTime() && date.getTime()<= periodo[1].getTime()){
                    let state;
                    if(line.toString().includes(mensaje)){
                        state='start';
                    }else if(line.toString().includes('transact:***')){
                        state='duda';
                    }else{
                        state='stop';
                    }

                    const tempLine= [];

                    tempLine.push(yearString+'-'+mesString+'-'+diaString);
                    tempLine.push(horaString);
                    tempLine.push(state);

                    arrCases.push(tempLine);
                }
                if(!periodo){
                    let state;
                    if(line.toString().includes(mensaje)){
                        state='start';
                    }else if(line.toString().includes('transact:***')){
                        state='duda';
                    }else{
                        state='stop';
                    }
                    const tempLine= [];

                    tempLine.push(yearString+'-'+mesString+'-'+diaString);
                    tempLine.push(horaString);
                    tempLine.push(state);

                    arrCases.push(tempLine);
                }
    
            }
        })


        rd.on('close', _=>resolve(arrCases));

        
        streamer.on('end', _=>resolve(arrCases));
    })
}


const procesarArray= (arr)=>{
    const newArr= [];
    let segundosTotales=0;
    newArr.push(['Fecha Inicio Caida', 'Fecha Fin Caida', 'Hora Inicio Caida','Hora Fin Caida', 'Diferencia', 'Diferencia en segundos'].join(','));
    //let segundosTotales=0;
    for(let i in arr){
        i=parseInt(i);
        if(i!==0 && arr[i][2]=='start' && arr[i-1][2]=='stop'){
            //console.log(arr[i]);
            const fechaInicioCaida= arr[i-1][0];
            const fechaFinCaida= arr[i][0];
            const horaInicioCaida= arr[i-1][1];
            const horaFinCaida= arr[i][1];

            const fechaInicioConHora= new Date(fechaInicioCaida+'T'+horaInicioCaida+'Z');
            const fechaFinConHora= new Date(fechaFinCaida+'T'+horaFinCaida+'Z');

            let diferenciaEnSegundos= (fechaFinConHora-fechaInicioConHora)/1000;
            const h= Math.floor(diferenciaEnSegundos/3600);
            const m= Math.floor(diferenciaEnSegundos/60)- h*60;
            const s= diferenciaEnSegundos- m*60 - h*3600;

            const diferencia= (h.toString().length==1?'0'+h.toString():h)+':'+(m.toString().length==1?'0'+m.toString():m)+':'+(s.toString().length==1?'0'+s.toString():s);

            newArr.push([fechaInicioCaida, fechaFinCaida, horaInicioCaida, horaFinCaida, diferencia,  diferenciaEnSegundos].join(','));
            
            segundosTotales+=diferenciaEnSegundos;
        } else if(i!==0 && arr[i][2]=='start' && arr[i-1][2]=='duda'){
            const fechaInicioCaida= arr[i-2][0];
            const fechaFinCaida= arr[i][0];
            const horaInicioCaida= arr[i-2][1];
            const horaFinCaida= arr[i][1];

            const fechaInicioConHora= new Date(fechaInicioCaida+'T'+horaInicioCaida+'Z');
            const fechaFinConHora= new Date(fechaFinCaida+'T'+horaFinCaida+'Z');

            let diferenciaEnSegundos= (fechaFinConHora-fechaInicioConHora)/1000;
            const h= Math.floor(diferenciaEnSegundos/3600);
            const m= Math.floor(diferenciaEnSegundos/60)- h*60;
            const s= diferenciaEnSegundos- m*60 - h*3600;

            const diferencia= (h.toString().length==1?'0'+h.toString():h)+':'+(m.toString().length==1?'0'+m.toString():m)+':'+(s.toString().length==1?'0'+s.toString():s);

            newArr.push([fechaInicioCaida, fechaFinCaida, horaInicioCaida, horaFinCaida, diferencia,  diferenciaEnSegundos].join(','));
            
            segundosTotales+=diferenciaEnSegundos;
        }
    }

    const jsonRespuesta= {
        arrayProcesado: newArr.join('\n'),
        segundosTotales: segundosTotales
    }

    return jsonRespuesta;
}