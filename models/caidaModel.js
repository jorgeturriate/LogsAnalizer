const fs= require("fs");
const path= require("path");

const p= path.join(
    path.dirname(require.main.filename || process.mainModule.filename),
    'data',
    'caidas.json'
);

module.exports= class Caida {
    constructor(servicio, mina, duracion, updated){
        this.servicio= servicio;
        this.mina= mina;
        this.duration= duration;
        this.updated= updated;
    }

    save(){
        fs.readFile(p, (error, fileContent)=>{
            if(error){
                throw "Ocurrio un error tratando de leer el archivo";
            }
            const dataCaida= JSON.parse(fileContent);
            
            dataCaida[this.servicio][this.mina].duration= this.duration;
            dataCaida[this.servicio][this.mina].updated= this.updated;

            fs.writeFile(p, JSON.stringify(dataCaida), (err)=>{
                console.log(err);
            });
        })
    }

    static async getCaida(servicio, mina){

        return new Promise(resolve=>{
            fs.readFile(p, (error, fileContent)=>{
                if(error){
                    throw "Ocurrio un error tratando de leer el archivo";
                }
                const dataCaida= JSON.parse(fileContent);

                //console.log(dataCaida[servicio][mina]);
                
                resolve(dataCaida[servicio][mina]);
            })
        })   
    }

}