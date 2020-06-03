//Dependencies
const express= require('express');
const bodyParser= require('body-parser');
const multer= require('multer');
const path= require('path');

const app= express();

//Imports
const dispatchRoute= require('./routes/dispatchRoute');
const provisionRoute= require('./routes/provisionRoute');

app.use(bodyParser.urlencoded({extended: false}));

// view engine setup
app.use(express.static(__dirname+'/public'));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(dispatchRoute);
app.use(provisionRoute);

app.get('/', (req,res,next)=>{
    return res.render('index.html');
});


app.use((req,res,next)=>{
    res.send('<p>La pagina que ha buscado no existe</p>');
})


//App listenning
app.listen(3000, ()=>{
    console.log('App corriendo en el puerto 3000');
});