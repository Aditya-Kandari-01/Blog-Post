require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const connectionDB = require('./server/config/db');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const session = require('express-session');

const { isActiveRoute } = require('./server/helpers/routeHelpers');

const app = express();
const PORT = process.env.PORT || 5000; 
 

connectionDB();
app.use((req, res, next) => {
    res.locals.currentRoute = req.originalUrl; // Set currentRoute to the current URL path
    next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'dog barks',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.mongoose_uri,
    }),

}));

app.use(express.static('public'));


//Templating Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;



app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));




app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
})