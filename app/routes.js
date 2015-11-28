'use strict';
var user = require('./controllers/user');
var question = require('./controllers/question');

//custome middleware to ensure that our user is authenticated
var isAuthenticated = function(req, res, next) {
    if(req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
};

module.exports = function(app) {
    //User functionality
    app.get('/', isAuthenticated, user.home);
    app.get('/home', isAuthenticated, user.home);
    app.get('/login', user.getLogin);
    app.post('/login', user.postLogin);
    app.get('/signup', user.getSignup);
    app.post('/signup', user.postSignup);
    app.get('/logout', user.logout);
    app.get('/settings', isAuthenticated, user.settings);
    app.put('/settings/:id', isAuthenticated, user.update);


    //Question functionality
    app.get('/random', isAuthenticated, question.random);
    app.post('/questions', isAuthenticated, question.create); 
    app.get('/questions/:id', isAuthenticated, question.editOrAnswer);
    app.post('/questions/:id', isAuthenticated, question.answer);
    app.put('/questions/:id', isAuthenticated, question.update);
    app.delete('/questions/:id', isAuthenticated, question.destroy);
    app.post('/questions/:id/tag', isAuthenticated, question.addTagToQuestion);
    app.delete('/questions/:id/tag/:tagId', isAuthenticated, question.deleteTagFromQuestion);

    //Tag functionality
    app.get('/tags', isAuthenticated, question.tagIndex);
    app.get('/tags/:name', isAuthenticated, question.showTag);

    //Question API functionality for AJAX calls
     

};
