'use strict';

module.exports = function(sequelize, DataTypes) {
    var Tag = sequelize.define('Tag', {
        name: {
            type: DataTypes.STRING,
            unique: true
        }
    }, {
        classMethods: {
            associate: function(models) {
                Tag.belongsToMany(models.Question, {through: 'QuestionTag'});
            }
        },
    });

    return Tag;
};
