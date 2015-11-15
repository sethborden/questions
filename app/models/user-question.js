'use strict';

module.exports = function(sequelize, DataTypes) {
    var UserQuestions = sequelize.define('UserQuestions', {
        answer: DataTypes.STRING,
        correct: DataTypes.BOOLEAN
    });

    return UserQuestions;
};
