var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()

var allAccess = require('./routes/allAccess');
var authRoute = require('./routes/authRoute');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', allAccess);
app.use('/p', authRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404).send('No such Route Exists');
});

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   res.status(err.status || 500);
//   res.json({error: 'error'});
// });

module.exports = app;
