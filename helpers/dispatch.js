const fs = require('fs');
const readline = require('readline');

/*
    LOGICA PARA CAPTURAR LOS ARGUMENTOS PASADOS AL SCRIPT, 
    Cuando es 4 es cuando solo se pasa la fecha de inicio y fin,
    Cuando es 6 tambien se incluye junto a la fecha de inicio la hora inicial y a la fecha de fin la hora final
    Cuando es cualquier otro caso se analizaran todos los casos del log, pero ya no habra ningun porcentaje en el CSV generado
*/

exports.generacionReporte= async (dispatchlog, starterlog, fechaInicio, fechaFin, horaInicio, horaFin, mina)=>{

    //Path de ubicacion del reporte
    const pathReporte= 'uploads/dispatch'+mina+'.csv';

    const writeStream= fs.createWriteStream(pathReporte);
    let arrCases;
    let arrCases1;
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

    //Leemos el log starter y hacemos el filtrado para obtener en el array las caidas y running
    arrCases= await leerLogs(starterlog, args);

    //console.log(arrCases);

    //Leemos el log dispatch y hacemos el filtrado para obtener en el array las caidas y running a la vez de eliminar los repetidos
    arrCases1= await leerLogsFiltrandoRepetidos(dispatchlog, args, arrCases);

    //Hacemos un merge y ordenamos los logs de menor a mayor
    arrCases= [...arrCases, ...arrCases1];
    arrCases.sort((a,b)=>{
    return new Date(a[0]+' '+a[1]) - new Date(b[0]+' '+b[1]);
    })

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
    fs.unlink(starterlog,(err)=>{
        if (err) throw(err);
        console.log('Borrado el log del starter');
    })

    fs.unlink(dispatchlog,(err)=>{
        if (err) throw(err);
        console.log('Borrado el log de Dispatch');
    })
    
    writeStream.end();
    console.log('Script terminado');
}


const leerLogs= async (filePath, periodo)=>{

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
            const date= new Date(line.slice(1,20));
            if(line.toString().includes('Commiting') || line.toString().includes('Uncommiting')){
                //console.log(line);
                //console.log(line.slice(1,20))
                if(periodo && date.getTime()>= periodo[0].getTime() && date.getTime()<= periodo[1].getTime()){
                    const state= line.toString().includes('Commiting') ? 'start' : 'stop';
                    const tempLine= line.split(',')[0].split(' ');
                    tempLine[0]=tempLine[0].slice(1,tempLine[0].length);
                    tempLine.push(state);
                    //console.log(tempLine);
                    arrCases.push(tempLine);
                    //console.log(arrCases);
                }
                if(!periodo){
                    const state= line.toString().includes('Commiting') ? 'start' : 'stop';
                    const tempLine= line.split(',')[0].split(' ');
                    tempLine[0]=tempLine[0].slice(1,tempLine[0].length);
                    //console.log(tempLine);
                    tempLine.push(state);
                    arrCases.push(tempLine);
                }
    
            }

            /*if(line.toString().includes('Fin')){
                console.log('Llegaste al fin del documento');
                rd.close();
            }*/
        })

        //events.once(rd, 'close');

        rd.on('close', _=>resolve(arrCases));

        
        streamer.on('end', _=>resolve(arrCases));
    })
}


const leerLogsFiltrandoRepetidos= async (filePath, periodo, arrComparar)=>{

    const streamer= fs.createReadStream(filePath);

    const arrCases1= [];
    const rd= readline.createInterface({
        //input: readerStreamStarter,
        input: streamer,
        console: false
    })

    return new Promise(resolve=>{
        console.log('Dentro de la segunda promesa');

        streamer.on('error', _ => resolve(null));

        rd.on('line', async function(line) {
            if(line.toString().includes('Commiting DispatchServiceHost') || line.toString().includes('Uncommiting DispatchServiceHost')){
                //console.log(line);
                const date= new Date(line.slice(1,20));
                //console.log(line.slice(1,20))
                if(periodo && date.getTime()>= periodo[0].getTime() && date.getTime()<= periodo[1].getTime()){
                    const state= line.toString().includes('Commiting DispatchServiceHost') ? 'start' : 'stop';
                    const tempLine= line.split(',')[0].split(' ');
                    tempLine[0]=tempLine[0].slice(1,tempLine[0].length);

                    //Ahora filtro dentro de estos casos los que sean diferentes a los casos ya mostrados en el log Starter
                    let repetido= false;
                    for(let i in arrComparar){
                        i= parseInt(i);
                        const dateComparar= new Date(arrComparar[i][0]+' '+arrComparar[i][1]);
            
                        if(state===arrComparar[i][2] && (Math.abs(dateComparar-date)/1000)<=230){
                            //console.log('repetido');
                            repetido=true;
                            break;
                        }
                    }

                    if(!repetido){
                        tempLine.push(state);
                        if(!(state==='start' && (arrCases1.slice(-1).pop()===undefined || arrCases1.slice(-1).pop()[2]==='start'))){
                        arrCases1.push(tempLine); 
                        }
                    }
                }
                if(!periodo){
                    const state= line.toString().includes('Commiting ClassicDispatchAdapter') ? 'start' : 'stop';
                    const tempLine= line.split(',')[0].split(' ');
                    tempLine[0]=tempLine[0].slice(1,tempLine[0].length);
                    
                    //Ahora filtro dentro de estos casos los que sean diferentes a los casos ya mostrados en el log Starter
                    let repetido= false;
                    for(let i in arrComparar){
                        i= parseInt(i);
                        const dateComparar= new Date(arrComparar[i][0]+' '+arrComparar[i][1]);
                        if(state===arrComparar[i][2] && (Math.abs(date-dateComparar)/1000)<=230){
                            repetido=true;
                            break;
                        }
                    }

                    if(!repetido){
                        tempLine.push(state);
                        if(!(state==='start' && (arrCases1.slice(-1).pop()===undefined || arrCases1.slice(-1).pop()[2]==='start'))){
                        arrCases1.push(tempLine); 
                        }
                    }
                }
            }
        });

        rd.on('close', ()=>resolve(arrCases1));
    })
}





const procesarArray= (arr)=>{
    const newArr= [];
    let segundosTotales=0;
    newArr.push(['Fecha Inicio Caida', 'Fecha Fin Caida', 'Hora Inicio Caida','Hora Fin Caida', 'Diferencia', 'Diferencia en segundos'].join(','));
    //let segundosTotales=0;
    for(let i in arr){
        i=parseInt(i);
        if(i!==arr.length-1 && arr[i][2]=='stop' && arr[i+1][2]=='start'){
            //console.log(arr[i]);
            const fechaInicioCaida= arr[i][0];
            const fechaFinCaida= arr[i+1][0];
            const horaInicioCaida= arr[i][1];
            const horaFinCaida= arr[i+1][1];

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