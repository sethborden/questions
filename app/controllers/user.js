'use strict';

var models = require('../models');

exports.index = function() {};

//Returns the login page
exports.getLogin = function(req, res) {
    res.render('login');
};

//Check if a users name and password are good, then log them in
exports.postLogin = function(req, res) {
    models.User.findOne({where: {username: req.body.username}})
    .then(function(user) {
        if(!user) { res.redirect('/login'); }
        if(user.comparePassword(req.body.password)) {
            req.session.user = user;
            res.redirect('/home');
        } else {
            res.redirect('/login');
        }
    });
};

//Serve our signup page
exports.getSignup = function(req, res) {
    res.render('signup');
};

//Create a new user
exports.postSignup = function(req, res) {
    models.User.create({
        username: req.body.username,
        password: req.body.password
    }).then(function(user) {
        res.send(user);
    });
};


//Logs out the user
exports.logout = function(req, res) {
    req.session.destroy();
    res.redirect('/');
};

//Returns a users homepage
exports.home = function(req, res) {
    models.Question.findAll({where: {UserId: req.session.user.id}})
    .then(function(questions) {
        res.render('home', {
            user: req.session.user,
            questions: questions
        });
    });
};

