var fs = require('fs')
  , demographics
  , questions;

fs.readFile('./lib/demographics.json', function(err, data){
  demographics = parseJSON(err, data);
});
fs.readFile('./lib/questions.json', function(err, data){
  questions = parseJSON(err, data);
});

exports.jsonp = function(req, res, next) {
  var jsonp = req.query.callback;
  if (jsonp) {
    req.jsonp = jsonp;
  }
  next();
}

renderResponse = function(json, req, res) {
  var response;
  if(req.jsonp) {
    res.contentType('application/x-javascript');
    response = req.jsonp + '(' + JSON.stringify(json) + ')';
  } else {
    res.contentType('application/json');
    response = JSON.stringify(json);
  }
  res.send(response);
}

exports.getDemographics = function(req, res) {
  var question_id = req.params.question_id;
  var json;
  if(demographics[question_id]){
    json = {
        statusCode: 200
        , question: demographics[question_id]
      };
  } else {
    json = {
        statusCode: 404
        , msg: 'Question not found'
      };
    
  }
  
  renderResponse(json, req, res);
}

exports.getQuestions = function(req, res) {
  console.log(req.query);
  //get random question that matches our demographics
  var question = getQuestion(req.query);
  
  
  
  var json = {
        statusCode: 200
        , question: question
      };
  
  renderResponse(json, req, res);
}

function getQuestion(query){
  var question_id = Math.floor(Math.random() * questions.questions.length);
  var question = questions.questions[question_id];
  if(question.genders.indexOf(parseInt(query.gender, 10)) != -1 && question.recipients.indexOf(parseInt(query.recipient, 10)) != -1){
    return question;
  } else {
    return getQuestion(query);
  }
}


function parseJSON(err, data) {
  if(err) {
    console.error("Could not open config file: ", err);
    process.exit(1);
  }
  
  try {
    var json = JSON.parse(data);
    return json;
  }
  catch(exception) {
    console.error("There was an error parsing the json config file: ", exception);
    process.exit(1);
  }
};
