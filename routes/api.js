var fs = require('fs')
  , demographics = require('../lib/demographics')
  , questions = require('../lib/questions');

exports.getDemographics = function(req, res) {
  var question_id = req.param('question_id'),
      question = demographics[question_id];

  if (question) {
    res.json(question);
  } else {
    res.json('Question not found', 404);
  }
};

exports.getQuestions = function(req, res) {

  // Required parameters
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
  Object.keys(allowed).forEach(function(p) {
    if (allowed[p].indexOf(req.param(p)) == -1) {
      error = req.param(p) + ' is an unknown ' + p;
    }
  });
  
  if (error) {
    return res.json(error, 400);
  }
  
  var question = (function(query) { 
    var question_id = Math.floor(Math.random() * questions.length)
      , question = questions[question_id];

    if (question.genders.indexOf(query.gender) != -1 && 
        question.recipients.indexOf(query.recipient) != -1) {
      return question;
    } else {
      return arguments.callee(query);
    }
  })(req.query);

  if (question) {
    res.json(question);
  } else {
    res.json('Question not found', 404);
  }
  
};

