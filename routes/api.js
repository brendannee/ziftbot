var fs = require('fs')
  , _ = require('underscore')
  , demographics = require('../lib/demographics')
  , questions = require('../lib/questions')
  , email = require('mailer');
  
//Add index to questions
questions.forEach(function(q, i) {
  questions[i].id = i;
  questions[i].type = 'question';
});

module.exports = function routes(app){

  return {
    getDemographics: function(req, res) {
      var question_id = req.param('question_id'),
          question = demographics[question_id];

      if (question) {
        res.json(question);
      } else {
        res.json('Question not found', 404);
      }
    },

    getQuestions: function(req, res) {
      var missing = [];
      [ 'gender', 'recipient' ].forEach(function(p) {
        if (!req.query[p]) {
          missing.push(p);
        }
      });

      if (missing.length) {
        return res.json('Missing parameter(s): ' + missing.join(', '), 400);
      }

      var allowed = {
          gender: [ 'male', 'female' ]
        , recipient: [ 'spouse', 'friend', 'parent', 'sibling', 'child', 'enemy' ]
      };

      var error;
      _.keys(allowed).forEach(function(p) {
        if (allowed[p].indexOf(req.param(p)) == -1) {
          error = req.param(p) + ' is an unknown ' + p;
        }
      });
  
      if (error) {
        return res.json(error, 400);
      }

      var n = questions.length
        , ignore = req.param('ignore') ? req.param('ignore').split(',') : false
        , possibleQuestions = ignore
            ? _.reject(_.clone(questions), function(q, i) { return _.contains(ignore, ''+i); })
            : _.clone(questions);
  
      possibleQuestions = _.reject(possibleQuestions, function(q) {
        return (!_.contains(q.genders, req.param('gender')) ||
               !_.contains(q.recipients, req.param('recipient')));
      });

      if (!possibleQuestions.length) {
        res.json('No more questions', 402);
      } else { 
        var i = Math.floor(Math.random() * possibleQuestions.length);
        res.json(possibleQuestions[i]);
      }
    },

    getProduct: function(req, res) {
      app.set('zappos').getProduct(
        req.param('product_id'), 
        ['videos', 'productRating', 'overallRating', 'comfortRating', 'lookRating', 'defaultCategory', 'defaultProductType', 'defaultSubCategory', 'description', 'styles'], 
        function(err, data){
          res.json(err || data);
        });
    },
    
    sendProduct: function(req, res) {
      var missing = [];
      [ 'to', 'firstName', 'lastName', 'product_id' ].forEach(function(p) {
        if (!req.query[p]) {
          missing.push(p);
        }
      });
      
      if (missing.length) {
        return res.json('Missing parameter(s): ' + missing.join(', '), 400);
      }
      
      app.set('zappos').getProduct(
        req.param('product_id'), 
        ['productRating', 'overallRating', 'comfortRating', 'lookRating', 'defaultCategory', 'defaultProductType', 'defaultSubCategory', 'description', 'styles'], 
        function(err, data){
          if(err){
            res.json(err);
          } else {
            var subject = req.param('firstName') + ' thinks you should check out ' + data[0].brandName + ' ' + data[0].productName;
            var body = 'I was browsing <a href="http://zitbot.com">ZiftBot</a> and found ' + data[0].brandName + ' ' + data[0].productName;
              ' - I thought you might be interesting in this.';
            body += req.param('message') || '';
            body += '<h2>' + data[0].brandName + ' ' + data[0].productName + '</h2>'
            if(data[0].styles.length){
              body += '<img src="' + data[0].styles[0].imageUrl + '">' +
                data[0].styles[0].originalPrice + '<br>';
            }
            body += '<p>' + data[0].description + ' </p>';
              '<a href="' + data[0].defaultProductUrl + '">View product details</a>';
            
            body += req.param('message') || '';
            
            var sgusername = 'blinktag';
            var sgpassword = process.env.SENDGRID_PW;
            email.send({
              host : "smtp.sendgrid.net",
              port : "587",
              domain : "ziftbot.com",
              to : req.param('to'),
              sub : {
                "%name%": req.param('firstName') + ' ' + req.param('lastName'),
              },
              from : "noreply@ziftbot.com",
              subject : subject,
              body: body,
              authentication : "login",
              username : sgusername,
              password : sgpassword
            },
            function(err, data){
              console.log(err);
              res.json(err || data);
            });
          }
        });
    }
  }
}
