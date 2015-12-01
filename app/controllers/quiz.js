'use strict';

var models = require('../models');

exports.index = function(req, res) {
    models.Quiz.findAll().then(function(quizzes) {
        res.render('quiz', {user: req.session.user, quizzes: quizzes});
    });
};

exports.show = function(req, res) {
    models.Quiz.findById(req.params.id, {include: [models.Question]})
    .then(function(quiz) {
        if(quiz.UserId === req.session.user.id) {
            res.render('quiz-edit', {quiz: quiz, user: req.session.user});
        } else {
            res.render('quiz-answer', {quiz: quiz, user: req.session.user});
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
            .then(function(quiz) {
                res.redirect('/quiz/' + quiz.id);
            });
        } else {
            req.flash('danger', 'You are not allowed to add to that quiz.');
            res.redirect('/home');
        }
    });
};

exports.removeQuestionFromQuiz = function(req, res) {
    Promise.all([
        models.Quiz.findById(req.params.id),
        models.Question.findById(req.params.questionId)
    ])
    .then(function(values) {
        var quiz = values[0];
        var question = values[1];
        if(quiz.UserId === req.session.user.id) {
            quiz.removeQuestion(question)
            .then(function() {
                res.redirect('/quiz/' + quiz.id);
            });
        } else {
            req.flash('danger', 'You cannot delete questions from that quiz.');
            res.redirect('/home');
        }
    });
};

exports.scoreQuiz = function(req, res) {
    //Get the quiz
    models.Quiz.findById(req.params.id, {include: [models.Question]})
    .then(function(quiz) {
        var correctedQuiz = quiz.Questions.map(function(q) {
            return {
                question: q.question,
                correctAnswer: q.answer,
                providedAnswer: req.body[q.id] || 'none',
                correct: q.answer === req.body[q.id]
            };
        });
        var correctCount = correctedQuiz.filter(function(q) {
            return q.correct === true;
        }).length;
        var totalCount = correctedQuiz.length;
        res.render('quiz-results', {
            quiz: quiz, 
            results: {
                correct: correctCount,
                total: totalCount,
                answers: correctedQuiz
            }
        });
    });
};
