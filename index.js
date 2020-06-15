/**
 *  APLICACION DESARROLLADA POR JORGE TURRIATE, CUALQUIER CONSULTA CONTACTARME
 */

//Dependencies
const express= require('express');
const bodyParser= require('body-parser');
const multer= require('multer');
const path= require('path');

const app= express();

//Imports
const dispatchRoute= require('./routes/dispatchRoute');
const provisionRoute= require('./routes/provisionRoute');
const pageRoute= require('./routes/pageRoute');

app.use(bodyParser.urlencoded({extended: false}));

// view engine setup
app.use(express.static(__dirname+'/public'));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(dispatchRoute);
app.use(provisionRoute);
app.use(pageRoute);

app.get('/', (req,res,next)=>{
    return res.render('index.html');
});

app.use((error,req,res,next)=>{
    res.status(500).render('error.html');
})

app.use((req,res,next)=>{
    res.render('notFound.html');
})


//App listenning
app.listen(3000, ()=>{
    console.log('App corriendo en el puerto 3000');
});