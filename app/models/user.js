'use strict';

var bcrypt = require('bcrypt');

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
        },
        setterMethods: {
            password: function(pw) {
                this.setDataValue('password', bcrypt.hashSync(pw, 10));
            }
        },
        instanceMethods: {
            comparePassword: function(candidate) {
                return bcrypt.compareSync(candidate, this.getDataValue('password'));
            },
        }
    });

    return User;
};
