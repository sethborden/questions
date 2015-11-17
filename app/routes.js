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
            if(!user) { res.redirect('/login'); }
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
            //Get a count of all the unique questions that the user has
            //answered.
            models.sequelize.query( 
                ['SELECT UserId, QuestionId, count(*) as count',
                 'from UserQuestions WHERE UserId = ' + req.session.user.id,
                 'and correct = 1',
                 'group by UserId, QuestionId'].join(' '),
                {type: models.Sequelize.QueryTypes.SELECT}
            )
            .then(function(questions) { //success function
                //Find out which question has been answered the most by the user
                //In the case where questions is empty, we g
                var max = questions.length > 0 ? Math.max.apply(
                    null, 
                    questions.map(function(q){
                        return q.count;
                    })) : 0;

                //Determine which questions have been answered during the
                //current round. E.g. if max is 3, than any question with a
                //count equal to 3 has been answered and should not be shown to
                //the user.
                var answeredQuestions = questions.filter(function(q) {
                    return q.count === max;
                });

                //Set up our query to grab a random question. First set the
                //order to 'random' (TODO if we switch to another SQL dialect
                //'random' will be changed to 'RAND'). Then select only
                //questions where that the current user did not create.
                var query = {
                    order: [models.Sequelize.fn('random')],
                    where: {
                        UserId: {$ne: req.session.user.id}
                    }
                };

                //If we have more than one answered question, and we haven't
                //answered all the questions the same number of times. Select a
                //question that we haven't answered.
                if(answeredQuestions.length > 0 && answeredQuestions.length !== questions.length) {
                    query.where.id = {
                        $notIn: answeredQuestions.map(function(q) {
                            return q.QuestionId;
                        })
                    };
                } 

                //Returns a Promise of our executed query
                return models.Question.findOne(query);
            })
            .then(function(question) {
                res.render('question-answer', question.dataValues);
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
                .then(function(question) {
                    res.render('correct', {
                        answer: question.answer,
                        correct: question.correct
                    });
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
