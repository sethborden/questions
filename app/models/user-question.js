'use strict';

module.exports = function(sequelize, DataTypes) {
    var UserQuestions = sequelize.define('userquestions', {
        answer: DataTypes.STRING,
        correct: DataTypes.BOOLEAN,
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        }
    });

    return UserQuestions;
};
