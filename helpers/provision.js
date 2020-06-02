const fs = require('fs');
const readline = require('readline');

exports.generacionReporte= async (provisionLog, fechaInicio, fechaFin, horaInicio, horaFin, mina)=>{
    
}

const readerStream= fs.createReadStream('provision.log');
const writeStream= fs.createWriteStream('provision.csv');

const rd = readline.createInterface({
    input: readerStream,
    //output: process.stdout,
    console: false
});

const arrCases= [];
let args;
//let args= process.argv.length===4 ? process.argv.slice(2).map(d=>new Date(d)) : false;


/*
    LOGICA PARA CAPTURAR LOS ARGUMENTOS PASADOS AL SCRIPT, 
    Cuando es 4 es cuando solo se pasa la fecha de inicio y fin,
    Cuando es 6 tambien se incluye junto a la fecha de inicio la hora inicial y a la fecha de fin la hora final
    Cuando es cualquier otro caso se analizaran todos los casos del log, pero ya no habra ningun porcentaje en el CSV generado
*/
switch(process.argv.length){
    case 4:
        args= [new Date(process.argv[2]+'T00:00:00Z'), new Date(process.argv[3]+'T23:59:59Z')];
        break;
    case 6:
        args= [new Date(process.argv[2]+'T'+process.argv[3]+'Z'), new Date(process.argv[4]+'T'+process.argv[5]+'Z')];
        break;
    default:
        args= false;
        break;
}

var segundosTotales= 0;

rd.on('line', function(line) {
    if(line.toString().includes('Commiting ClassicDispatchAdapter') || line.toString().includes('Uncommiting ClassicDispatchAdapter')){
        //console.log(line);
        const date= new Date(line.slice(1,20));
        //console.log(date)
        if(args && date.getTime()>= args[0].getTime() && date.getTime()<= args[1].getTime()){
            const state= line.toString().includes('Commiting ClassicDispatchAdapter') ? 'start' : 'stop';
            const tempLine= line.split(',')[0].split(' ');
            tempLine[0]=tempLine[0].slice(1,tempLine[0].length);
            //console.log(tempLine);
            tempLine.push(state);
            arrCases.push(tempLine);
        }
        if(!args){
            const state= line.toString().includes('Commiting') ? 'start' : 'stop';
            const tempLine= line.split(',')[0].split(' ');
            tempLine[0]=tempLine[0].slice(1,tempLine[0].length);
            //console.log(tempLine);
            tempLine.push(state);
            arrCases.push(tempLine);
        }
    }
})


readerStream.on('end', ()=>{
    writeStream.write(procesarArray(arrCases));
    if(args){
        const rangoFecha= (args[1]-args[0])/1000;
        const porcentajeTotal= ((segundosTotales)/rangoFecha)*100;
        writeStream.write('\nSegundos Totales,'+segundosTotales+',Rango de fecha en segundos,'+rangoFecha+',Porcentaje Total,'+porcentajeTotal);
        writeStream.write('\n\nReporte realizado del '+arg[0]+' al '+arg[1]);
    }
    writeStream.end();
    //console.log(procesarArray(arrCases));
    console.log('Script terminado');
})


const procesarArray= (arr)=>{
    const newArr= [];
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

    return newArr.join('\n');
}