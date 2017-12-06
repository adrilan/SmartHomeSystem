var User = require('./models/user');
var url = require('url');
var querystring = require('querystring');
var db = []; // database


module.exports = function(app, passport){
    app.get('/', function(req, res){
        if (req.isAuthenticated()) {
            res.redirect('/dashboard');
        } else {
            res.render('home.ejs');
        }
    });

    app.get('/profile', isLoggedIn, function(req, res){
        res.render('profile.ejs', { user: req.user });
    });

    app.get('/dashboard', isLoggedIn, function(req, res) {
        res.render('dashboard.ejs', { user: req.user });
    });

    app.get('/video', isLoggedIn, function(req, res) {
        res.redirect('http://192.168.1.17/html');
    });

    app.get('/auth/facebook', passport.authenticate('facebook', { 
      scope : ['public_profile', 'email']
  }));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/dashboard',
            failureRedirect : '/'
        }));

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    // app.get('/update', function(req, res) {
    //     var uriData = url.parse(req.url);
    //     var pathName = uriData.pathname; //   /update
    //     var query = uriData.query;       //   temp=30&humd=40
    //     var queryData = querystring.parse(query);

    //     var newData = {
    //         temp: queryData.temp,
    //         humd: queryData.humd,
    //         time: new Date()
    //     };
    //     db.push(newData);
    //     res.end();

    //     console.log(newData);
    // });

    // app.get('/get', function(req, res) {
    //     res.writeHead(200, {
    //         'Content-Type': 'application/json'
    //     });
    //     res.end(JSON.stringify(db));
    //     db = [];
    // });
};

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}