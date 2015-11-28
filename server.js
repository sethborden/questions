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

//Importer function to load questions
var questions = [
    {
        question: 'What is the meaning of life?',
        answer: '42',
        Tags: ['life'],
        UserId: 1
    },
    {
        question: 'What is capital of East Timor?',
        answer: 'Dili',
        Tags: ['geography'],
        UserId: 1
    },
    {
        question: 'What is the capital of Vermont?',
        answer: 'Montpelier',
        Tags: ['geography'],
        UserId: 1
    },
    {
        question: 'What is capital of New Hampshire?',
        answer: 'Concord',
        Tags: ['geography'],
        UserId: 1
    }
];

//TODO break this out into a separate helper module.
var importQuestions = function(questions) {
    return Promise.all(
        questions.map(function(question) {
            models.Question.create(question).
            then(function(q) {
                return Promise.all(
                    question.Tags.map(function(tag) {
                        models.Tag.findOrCreate({where: {name: tag}})
                        .then(function(tag) {
                            q.addTag(tag[0]);
                        });
                    })
                );
            });
        })
    );
};

//Kick things off
models.sequelize.sync({force: true})
.then(function() {
    Promise.all([
        models.User.create({ username: 'Seth', password: 'pass', email: 'seth@mimirate.com' }),
        models.User.create({ username: 'Mark', password: 'bill', email: 'mark@mimirate.com' }),
        importQuestions(questions)
    ])
    .then(function() {
        app.listen(port);
        console.log('App listening on http://localhost:', port);
    }, function(err) {
        console.log(err);
    });
});
