'use strict';

var models = require('../models');

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
