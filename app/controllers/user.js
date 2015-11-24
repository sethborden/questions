'use strict';

var models = require('../models');

exports.index = function() {};

//Returns the login page
exports.getLogin = function(req, res) {
    res.render('login');
};

exports.settings = function(req, res) {
    res.render('setting', req.session.user);
};

exports.update = function(req, res) {
    models.User.findOne({where: {username: req.body.username}})
    .then(function(user) {
        return user.updateAttributes({
            email: req.body.email
        });
    })
    .then(function(user) {
        req.session.user = user;
        req.flash(['Updated', user.username, '\b\'s email to', user.email, '.'].join(' '));
        res.redirect('/home');
    });
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
        password: req.body.password,
        email: req.body.email,
    }).then(function(user) {
        req.session.user = user;
        res.redirect('/home');
    });
};


//Logs out the user
exports.logout = function(req, res) {
    req.flash('info', 'Logout Successful.');
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

