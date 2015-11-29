'use strict';

var models = require('../models');

exports.index = function(req, res) {
    models.Question.findAll({include: [{model: models.Tag}]})
    .then(function(questions){
        res.json(questions);
    });
};

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
            },
            include: [
                {
                    model: models.Tag
                }
            ]
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
            res.json(question.dataValues);
        } else {
            res.json({message: 'No questions'});
        }
    });
};
