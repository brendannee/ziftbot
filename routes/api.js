var fs = require('fs')
  , _ = require('underscore')
  , demographics = require('../lib/demographics')
  , email = require('mailer');
  
module.exports = function routes(app){
  var db = app.set('db')
    , Question = db.model('Question');

  return {
    getDemographicQuestion: function(req, res) {
      var question_id = req.param('question_id'),
          question = demographics[question_id];

      if (question) {
        res.json(question);
      } else {
        res.json('Question not found', 404);
      }
    },

    createQuestion: function(req, res) {
      var question = {}
        , missing = [];

      [ 'text', 'product' ].forEach(function(p) {
        if (!req.param(p)) {
          missing.push(p);
        } else {
          question[p] = req.param(p);
        }
      });

      [ 'yes', 'no' ].forEach(function(p) {
        if (req.param(p)) {
          question[p] = req.param(p);
        }
      });

      [ 'genders', 'recipients' ].forEach(function(p) {
        if (req.param(p)) {
          question[p] = JSON.parse(req.param(p));
        }
      });

      if (missing.length) {
        return res.json('Missing parameter(s): ' + missing.join(', '), 400);
      }
  
      Question.create(question, function(e, question) {
        if (e || !question) return res.json('Unable to create question', 500);
        res.json(question.toObject());
      });
    },

    getRandomQuestion: function(req, res) {
      var missing = []
        , query = {};
      [ 'genders', 'recipients' ].forEach(function(p) {
        if (!req.param(p)) {
          missing.push(p);
        } else {
          query[p] = req.param(p);
        }
      });

      if (missing.length) {
        return res.json('Missing parameter(s): ' + missing.join(', '), 400);
      }

      var allowed = {
          genders: [ 'male', 'female' ]
        , recipients: [ 'spouse', 'friend', 'parent', 'sibling', 'child', 'enemy' ]
      };

      var error;
      _.keys(allowed).forEach(function(p) {
        if (allowed[p].indexOf(query[p]) == -1) {
          error = query[p] + ' is an unknown ' + p;
        }
      });
  
      if (error) {
        return res.json(error, 400);
      }

      var ignore = req.param('ignore') ? req.param('ignore').split(',') : false;
      if (ignore) {
        query._id = { $nin: ignore };
      }
      
      var rand = Math.random();
      query.random = { $gte: rand };
      //console.log(query);
      Question.findOne(query, function(e, question) {
        if (e) return next(e);

        if (question) {
          question.random = Math.random();
          question.save();
          return res.json(question);
        } else {
          query.random = { $lte: rand };
          Question.findOne(query, function(e, question) {
            if (e) return next(e);
            
            if (question) {
              question.random = Math.random();
              question.save();
              res.json(question);
            } else {
              res.json('No more questions', 402);
            }
          });
        }
      });

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
      [ 'to', 'sender', 'firstName', 'lastName', 'product_id' ].forEach(function(p) {
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
            var html = 'I was browsing <a href="http://zitbot.com">ZiftBot</a> and found ' 
              + data[0].brandName + ' ' + data[0].productName + ' - I thought you might like it.\n';
            var body = 'I was browsing http://zitbot.com and found '
              + data[0].brandName + ' ' + data[0].productName + ' - I thought you might like it.\n';
            if(req.param('message')) {
               html += '<p>' + req.param('message') + '</p>';
               body += req.param('message') + '\n\n';
            }

            html += '<h2><a href="' + data[0].defaultProductUrl + '">' + data[0].brandName + ' ' + data[0].productName + '</a></h2>'
            body += data[0].brandName + ' ' + data[0].productName + '\n\n'
            if(data[0].styles.length){
              html += '<a href="' + data[0].defaultProductUrl + '"><img src="' + data[0].styles[0].imageUrl + '"></a><br>' +
                '<strong>' + data[0].styles[0].originalPrice + '<strong><br>';
              body += data[0].styles[0].originalPrice + '\n';
            }
            html += '<p>' + data[0].description + ' </p><a href="' + data[0].defaultProductUrl + '">View product on Zappos.com</a>' +
              '<hr>This message from sent to you from Ziftbot.com on behalf of ' + req.param('sender') + '.';
            body += data[0].description + '\n Product URL: ' + data[0].defaultProductUrl +
              'This message from sent to you from Ziftbot.com on behalf of ' + req.param('sender') + '.';
            
            
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
              html: html,
              authentication : "login",
              username : app.set('sendgrid').username,
              password : app.set('sendgrid').password
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
