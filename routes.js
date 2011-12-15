var errors = require('./lib/util/errors')
  , api = require('./routes/api');

module.exports = function routes(app){

  // routes go here
  app.get('/', function(req, res){
    res.render('index', { title: 'ZiftBot'})
  });
  
  app.get('/api/demographics/:question_id', api.getDemographics);
  
  app.get('/api/questions', api.getQuestions);

  app.all('*', function notFound(req, res, next) {
    next(new errors.NotFound);
  });

}
