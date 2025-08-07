require ('dotenv').config();
const express = require('express');
const session = require('express-session');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo');
const connectDB = require('./server/config/db');
const {isActiveRoute} = require('./server/helpers/routeHelpers');
const app = express();

const PORT = process.env.PORT || 10000
//Mongo Db connection
connectDB();

//MiddleWare
app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));//using _method in .ejs files as to convert the post to put request


app.use(session({
    secret:'fast tiger',
    resave:false,
    saveUninitialized:true,
    store:MongoStore.create({
        mongoUrl:process.env.MONGODB_URI
    })
}))


app.use(express.static('public'));

//To use ejs layout
app.use(expressLayout);
app.set('layout','./layouts/main');
app.set('view engine','ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use('/',require('./server/routes/main'));
app.use('/',require('./server/routes/register'));

app.listen(PORT,()=>{
    console.log(`App listening on ${PORT}`);
})
