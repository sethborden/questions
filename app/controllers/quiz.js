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
    //helper function to sort answers by id
    var questionSort = function(q1, q2) {
        if(q1.id > q2.id) {
            return 1;
        }
        if(q1.id < q2.id) {
            return -1;
        }
        return 0;
    };

    //Get everything from the response body that's a quiz answer
    var responses = (function() {
        var tempObject = {};
        for(var key in req.body) {
            if(key.indexOf('quiz-response-') > -1) {
                tempObject[key] = req.body[key];
            }
        }
        return tempObject;
    }());

    //TODO PICK UP FROM HERE<S-F1><S-F1>

    //Get the quiz
    models.Quiz.findById(req.params.id, {include: [models.Question]})
    //Get all the questions in the quiz
    .then(function(quiz) {
      return quiz.Questions.sort(questionSort);
    })
    .then(function() {
        res.send(responses);
    });

    //Create a new object in the form of:
    //{
    //  correct: n, 
    //  total: m, 
    //  answers: [
    //    {
    //      yourAnswer: 'foo', 
    //      correctAnswer: 'bar'
    //    }
    //  ]
    //}
    //...and render it using the 'quiz-corrected' template

};
