'use strict';

module.exports = function(sequelize, DataTypes) {
    var Quiz = sequelize.define('Quiz', {
        name: {
            type: DataTypes.STRING,
            unique: true
        }
    }, {
        classMethods: {
            associate: function(models) {
                Quiz.belongsTo(models.User);
                Quiz.hasMany(models.Question);
            }
        }
    });

    return Quiz;
};
