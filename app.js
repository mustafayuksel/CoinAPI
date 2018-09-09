let port = 9001
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
var Request = require("request");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(bodyParser.json());
app.use(logger('dev'));

// Mongoose
mongoose.connect("mongodb://localhost:27017/coinapi", {
    "useNewUrlParser": true,
    "socketTimeoutMS": 0,
    "keepAlive": true,
    "reconnectTries": 10
});

var coinSchema = new mongoose.Schema({
    "_id": {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    }, "name": String
});

let Coins = mongoose.model("coins", coinSchema);

app.get("/coins", (req, res) => {
  res.set("Content-Type", "application/json");
  Coins.find({}, {"name" : true, "_id": false}, (err, coins) => {
      res.status(200).send(coins.map(coin => coin.name));
  });
});

app.get("coins/btcturk", (req, res) => {
    res.set("Content-Type", "application/json");
    Request.get("https://www.btcturk.com/api/ticker/", (error, response, body) => {
        if(error) {
            return console.dir(error);
        }
        res.status(200).send(JSON.parse(body));
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
app.listen(port);
console.log("Server is running @ port ".concat(port));