'use strict';

module.exports = function(sequelize, Datatypes) {
    var Question = sequelize.define('Question', {
        question: Datatypes.STRING,
        answer: Datatypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Question.belongsTo(models.User, {
                    onDelete: 'CASCADE',
                    foreignKey: {
                        allowNull: false
                    }
                });
                Question.belongsToMany(models.User, {
                    through: models.UserQuestions
                });
            }
        }
    });

    return Question;
};
