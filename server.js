require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');
const auth = require('./middleware/authentication');
const mongoose = require('mongoose');
const database = require('./config/database');
const mongoStore = require('connect-mongo')(session);

const app = express();
app.use(express.static('static/dist'));

app.set('views', `${__dirname}\\views`);
app.set('view engine', 'ejs');
//app.engine('.ejs', ejs); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(expressLayouts);
app.set('layout', 'layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true)

app.use(session({
  secret: process.env.SESSION_SECRET,
  store: new mongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 60 * 60 * 24 * 1000 },
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const homeRouter = require('./routes/home');
app.use('/Home', auth.isAuthenticated, homeRouter);
const loginRouter = require('./routes/user');
app.use('/User', loginRouter);
app.get('/', function (req, res) {
  res.redirect('/Home');
});

if (process.env.NODE_ENV === 'development') {
  app.use(function (req, res, next) {
    res.status(404).render('errors/error404', { title: '404' });
  });
  app.use(function (err, req, res, next) {
    res.status(err.status || 500).render('errors/error', { title: 'Error', statusCode: err.status || 500, message: err.message });
  });
}

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}...`);
});

//TODO: /Home error flash messages