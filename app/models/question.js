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
                    through: {
                        model: models.userquestions,
                        unique: false
                    }
                });
                Question.belongsToMany(models.Tag, {through: 'QuestionTag'});
            }
        }
    });

    return Question;
};
