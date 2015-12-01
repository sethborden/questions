'use strict';

var models = require('../models');

exports.index = function(req, res) {
    models.Quiz.findAll({where: {UserId: req.session.user.id}})
    .then(function(quizzes) {
        res.render('quiz', {user: req.session.user, quizzes: quizzes});
    });
};

exports.show = function(req, res) {
    models.Quiz.findById(req.params.id)
    .then(function(quiz) {
        if(quiz.UserId === req.session.user.id) {
            res.render('quiz-edit', {quiz: quiz, user: req.session.user});
        } else {
            res.send('not yet implemented');
        }
    });
};

exports.create = function(req, res) {
    models.Quiz.create({
        name: req.body.name,
        UserId: req.session.user.id
    })
    .then(function(quiz) {
        req.flash('info', 'Quiz ' + quiz.name + ' created.');
        res.redirect('/quiz');
    });
};

exports.addQuestionToQuiz = function(req, res) {
    Promise.all([
        models.Quiz.findById(req.params.id),
        models.Question.findById(req.body.questionId)
    ])
    .then(function(values) {
        var quiz = values[0];
        var question = values[1];
        if(quiz.UserId === req.session.user.id) {
            quiz.addQuestion(question)
            .then(function(updatedQuiz) {
                return models.Quiz.findOne(
                    {
                        where: {id: updatedQuiz.id}, 
                        include: [{model: models.Question}]
                    });
            })
            .then(function(q) {
                res.json(q);
            });
        } else {
            req.flash('danger', 'You are not allowed to add to that quiz.');
            res.redirect('/home');
        }
    });
};
