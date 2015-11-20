'use strict';

var models = require('../models');

//TODO: figure out how to break this out into a few, simpler functions
//Redirects to a random, unanswered question
//Returns a question object.
exports.random = function(req, res) {
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
};

exports.create = function(req, res) {
    models.Question.create({
        question: req.body.question,
        answer: req.body.answer,
        UserId: req.session.user.id
    }).then(function() {
        res.redirect('/home');
    });
};

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
            res.render('correct', {
                answer: question.answer,
                correct: question.correct
            });
        });
    });
};

//Update a question
exports.update = function(req, res) {
    res.send('not implemented');
};

//Delete a question
exports.destroy = function(req, res) {
    res.send('not implemented');
};
