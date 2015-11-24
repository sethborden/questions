'use strict';

var bcrypt = require('bcrypt');
var gravatar = require('gravatar');

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            unique: true
        },
        password: DataTypes.STRING,
        gravatarURL: DataTypes.STRING
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
        getterMethods: {
            gravatarURL: function() {
                return gravatar.url(this.getDataValue('email'));
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
