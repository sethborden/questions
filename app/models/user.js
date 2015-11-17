'use strict';

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        username: DataTypes.STRING,
        password: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                User.hasMany(models.Question);
                User.belongsToMany(models.Question, {
                    through: {
                        model: models.UserQuestions,
                        unique: false
                    }
                });
            }
        }
    });

    return User;
};
