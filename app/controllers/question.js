'use strict';

var models = require('../models');
var path = require('path');

//TODO: Rework this...it still isn't working correctly.
//Redirects to a random, unanswered question
//Returns a question object.
exports.random = function(req, res) {
    //Get a count of all the unique questions that the user has
    //answered correctly.
    models.sequelize.query( 
    //This statement needs to be mucked with A LOT if you switch SQL dialects
        ['SELECT "UserId", "QuestionId", count(*) as count',
         'from userquestions WHERE "UserId" = ' + req.session.user.id,
         'AND correct = true', 
         'group by "UserId", "QuestionId"'].join(' '),
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

//Add a tag to a question
exports.addTagToQuestion = function(req, res) {
    Promise.all([
        models.Question.findById(req.params.id),
        models.Tag.findOrCreate({where: {name: req.body.tag}})
    ])
    .then(function(values) {
        var question = values[0];
        var tag = values[1][0];
        question.addTag(tag)
        .then(function() {
            res.redirect('/questions/' + req.params.id);
        });
    });
};

//Delete a tag from a question
exports.deleteTagFromQuestion = function(req, res) {
    models.Question.findById(req.params.id)
    .then(function(question) {
        return question.removeTag(req.params.tagId);
    })
    .then(function() {
        res.redirect('/questions/' + req.params.id);
    });
};

//Get all questions with a given tag
exports.tagIndex = function(req, res) {
    if(req.query.tag) {
        res.redirect('/tags/' + req.query.tag);
    } else {
        models.Tag.findAndCountAll()
        .then(function(tags) {
            res.render('tags', {tags: tags.rows, count: tags.count});
        });
    }
};

//Get all questions with a specific tag
exports.showTag = function(req, res) {
    models.Question.findAll({
        include: [{
            model: models.Tag,
            where: { name: req.params.name } 
        }]
    })
    .then(function(questions) {
        res.render('question-search', {questions: questions, tag: req.params.name});
    });
};
