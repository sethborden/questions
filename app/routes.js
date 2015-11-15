'use strict';

var models = require('./models');

module.exports = function(app) {

    //Returns homepage if logged in, otherwise takes to you login
    app.get('/', function(req, res) {
        if(req.session.user) {
            res.redirect('/home');
        } else {
            res.redirect('/login');
        }
    });

    //Returns the login page
    app.get('/login', function(req, res) {
        res.render('login');
    });

    //Check if a users name and password are good, then log them in
    app.post('/login', function(req, res) {
        console.log(req.body.username);
        models.User.findOne({where: {username: req.body.username}})
        .then(function(user) {
            console.log(user.password, req.body.password);
            if(user.password === req.body.password) {
                req.session.user = user;
                res.redirect('/home');
            } else {
                res.redirect('/login');
            }
        });
    });

    //Serve our signup page
    app.get('/signup', function(req, res) {
        res.render('signup');
    });

    ////Get a list of all users
    //app.get('/users', function(req, res) {

    //});

    //Create a new user
    app.post('/users', function(req, res) {
        models.User.create({
            username: req.body.username,
            password: req.body.password
        }).then(function(user) {
            res.send(user);
        });
    });

    ////Allow an admin to get a users page
    //app.get('/users/:id', function(req, res) {

    //});

    ////Allow a user or admin to update their page
    //app.put('/users/:id', function(req, res) {

    //});

    ////Allow an admin to delete a user and associated questions
    //app.delete('/users/:id', function(req, res) {

    //});

    //Logs out the user
    app.get('/logout', function(req, res) {
        req.session.destroy();
        res.redirect('/');
    });

    //Returns a users homepage
    app.get('/home', function(req, res) {
        if(req.session.user) {
            models.Question.findAll({where: {UserId: req.session.user.id}})
            .then(function(questions) {
                res.render('home', {
                    user: req.session.user,
                    questions: questions
                });
            });
        } else {
            res.redirect('/login');
        }
    });

    /*
     * API like functionality
     */

    //Redirects to a random, unanswered question
    app.get('/random', function(req, res) {
        if(req.session.user) {
            //TODO there is a clever SQL query that would give me all the
            //unaswered questions here...figure out what it is.
            models.UserQuestions.findAll({where: {UserId: req.session.user.id}})
            .then(function(answeredQuestions) {
                var uniqueAnsweredQuestions = (function(a) {
                    return a.reduce(function(p, c) {
                        if(p.indexOf(c.QuestionId) < 0) { p.push(c.QuestionId); }
                        return p;
                    }, []);
                }(answeredQuestions));
                if(uniqueAnsweredQuestions.length === 0) {
                    return models.Question.findAll({
                        where: {
                            UserId: {$ne: req.session.user.id}
                        }
                    });
                } else {
                    return models.Question.findAll({
                        where: {
                            id: {$notIn: uniqueAnsweredQuestions}, 
                            UserId: {$ne: req.session.user.id}
                        }
                    }); //return a Promise
                }
            })
            .then(function(unansweredQuestions){
                var questionId = unansweredQuestions[(Math.floor(Math.random() * unansweredQuestions.length))].id; //pick a random, ua question
                res.redirect('/questions/' + questionId);
            });
        } else {
            res.redirect('/login');
        }
    });

    app.post('/questions', function(req, res) {
        if(req.session.user) {
            models.Question.create({
                question: req.body.question,
                answer: req.body.answer,
                UserId: req.session.user.id
            }).then(function() {
                res.redirect('/home');
            });
        } else {
            res.redirect('/login');
        }
    });

    //If the user owns the question, allow you to edit the question, otherwise
    //just space to answer
    app.get('/questions/:id', function(req, res) {
        models.Question.findOne({where: {id: req.params.id}})
        .then(function(question) {
            if(question.UserId === req.session.user.id) {
                res.render('question-edit', question.dataValues);
            } else {
                res.render('question-answer', question.dataValues);
            }
        });
    });

    //Answers a random question
    app.post('/questions/:id', function(req, res) {
        if(req.session.user) {
            models.Question.findOne({where: {id: req.params.id}})
            .then(function(question) {
                var correct = question.answer === req.body.answer;
                models.UserQuestions.create({
                    answer: req.body.answer,
                    correct: correct,
                    UserId: req.session.user.id,
                    QuestionId: question.id
                })
                .then(function() {
                    if(correct) {
                        res.end('Correct');
                    } else {
                        res.end('Wrong');
                    }
                });
            });
        }
    });
//
//    //Update a question (user only)
//    app.put('/questions/:id', function(req, res) {
//
//    });
//
//    //Delete a question if you own it
//    app.delete('/questions/:id', function(req, res) {
//
//    });
//
};
