'use strict';

var path = require('path');
var express = require('express');

var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('flash');

var models = require('./app/models');

var port = process.env.PORT || 8080;

var app = express();

//Setup express app
app.set('view engine', 'jade');

//Setup middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(require('connect-livereload')({
    port: 35729
}));
app.use(session({
    secret: 'apqowigpowup2424c8n510y 9fh',
    resave: false,
    saveUninitialized: true
}));
app.use(methodOverride('_method'));
app.use(flash());

//Import routes
require('./app/routes.js')(app);

//Kick things off
models.sequelize.sync({force: true})
.then(function() {
    Promise.all([
        models.User.create({ username: 'Seth', password: 'pass', email: 'seth@mimirate.com' }),
        models.User.create({ username: 'Mark', password: 'bill', email: 'mark@mimirate.com' }),
        models.Question.create({ question: 'What is the meaning of life?', answer: '42', UserId: 1 }),
        models.Question.create({ question: 'What is the capital of East Timor?', answer: 'Dili', UserId: 1 }),
        models.Question.create({ question: 'Who is the President of the United States?', answer: 'Barack Obama', UserId: 2 })
    ])
    .then(function() {
        app.listen(port);
        console.log('App listening on http://localhost:', port);
    });
});
