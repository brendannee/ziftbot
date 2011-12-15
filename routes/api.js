var fs = require('fs')
  , _ = require('underscore')
  , demographics = require('../lib/demographics')
  , questions = require('../lib/questions');
  
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
        , recipient: [ 'spouse', 'friend', 'parent', 'child', 'enemy' ]
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
        ['videos', 'productRating', 'overallRating', 'comforRating', 'lookRating', 'defaultCategory', 'defaultProductType', 'defaultSubCategory', 'description', 'styles'], 
        function(err, data){
          res.json(err || data);
        });
    }
  }
}
