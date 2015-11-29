'use strict';

var models = require('../models');
var path = require('path');

//Redirects to a random, unanswered question
//Returns a question object.
exports.random = function(req, res) {
    //Get a count of all the unique questions that the user has
    //answered correctly.
    Promise.all([
        //This statement needs to be mucked with A LOT if you switch SQL dialects
        models.sequelize.query( 
            ['SELECT "UserId", "QuestionId", count(*) as count',
             'from userquestions WHERE "UserId" = ' + req.session.user.id,
             'AND correct = true', 
             'group by "UserId", "QuestionId"'].join(' '),
            {type: models.Sequelize.QueryTypes.SELECT}
        ),
        models.Question.count({where: {UserId: {$ne: req.session.user.id}}})
    ])
    .then(function(values) { //success function
        //The number of questions that we HAVE answered
        var questions = values[0];
        //The total number of questions that we COULD answer
        var count = values[1];
        //The answer count for the question that we answer the most
        var max = Math.max(Math.max.apply(null, questions.map(function(q) {
            return parseInt(q.count, 10);
        })), 0);

        //Returns a list of questionIds of questions that we answered the
        //maximum number of times.
        var answeredQuestions = questions
            .filter(function(q) {
                return parseInt(q.count, 10) === max;
            }).map(function(q) {
                return q.QuestionId;
            });

        //the query that we're going to pass to te Question model
        var query = { 
            order: [models.Sequelize.fn('random')], 
            where: { 
                UserId: {
                    $ne: req.session.user.id
                },
            }, 
            include: [{model: models.Tag }] 
        };

        //We filter the query if and only if we're not at the start of a "round"
        if(answeredQuestions.length && answeredQuestions.length % count !== 0) {
            query.where.id = {
                $notIn: answeredQuestions
            };
        }

        //Returns a Promise of our executed query
        return models.Question.findOne(query);
    })
    .then(function(question) {
        if(question) {
            res.render('question-answer', question.dataValues);
        } else {
            req.flash('danger', 'No random questions available.');
            res.redirect('/home');
        }
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
    models.Question.findOne({
        where: {id: req.params.id}, 
        include: [
            {
                model: models.Tag
            }
        ]
    })
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
        models.userquestions.create({
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
