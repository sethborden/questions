'use strict';

var models = require('../models');
var path = require('path');

//TODO: Rework this...it still isn't working correctly.
//Redirects to a random, unanswered question
//Returns a question object.
exports.random = function(req, res) {
    //Get a count of all the unique questions that the user has
    //answered.
    models.sequelize.query( 
        ['SELECT UserId, QuestionId, count(*) as count',
         'from UserQuestions WHERE UserId = ' + req.session.user.id,
         'AND correct = 1', 
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
};

//Create a new question
exports.create = function(req, res) {
    models.Question.create({
        question: req.body.question,
        answer: req.body.answer,
        UserId: req.session.user.id
    }).then(function() {
        req.flash('info', 'Question created.');
        res.redirect('/home');
    });
};

//If you own the question, you get to edit it, otherwise you need to answer it
exports.editOrAnswer = function(req, res) {
    models.Question.findOne({where: {id: req.params.id}})
    .then(function(question) {
        if(question.UserId === req.session.user.id) {
            res.render('question-edit', question.dataValues);
        } else {
            res.render('question-answer', question.dataValues);
        }
    });
};

//Answers a question
exports.answer = function(req, res) {
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
            var message = [
                'Your answer of',
                question.answer,
                'was',
                question.correct ? 'correct!' : 'wrong.'
            ].join(' ');
            req.flash('info', message);
            if(path.basename(req.get('Referer')) === 'random') {
                res.redirect('/random');
            } else {
                res.redirect('/home');
            }
        });
    });
};

//Update a question
exports.update = function(req, res) {
    models.Question.find({where: {id: req.params.id}})
    .then(function(question) {
        if(!question) { res.send('No such question'); }
        if(question.UserId === req.session.user.id) {
            question.updateAttributes({
                question: req.body.question,
                answer: req.body.answer
            })
            .then(function() {
                req.flash('info', 'Question has been updated');
                res.redirect('/home');
            });
        }
    });
};

//Delete a question
exports.destroy = function(req, res) {
    models.Question.find({where: {id: req.params.id}})
    .then(function(question) {
        if(!question) { res.send('No such question'); }
        if(question.UserId === req.session.user.id) {
            question.destroy()
            .then(function() {
                req.flash('info', 'Question has been deleted.');
                res.redirect('/home');
            });
        }
    });
};
