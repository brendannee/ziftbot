var errors = require('./lib/util/errors')
  , api = require('./routes/api');

module.exports = function routes(app){

  // routes go here
  app.get('/', function(req, res){
    res.render('index', { title: 'ZiftBot'})
  });
  
  
  app.get('/api/demographics/:question_id', api.getDemographics);
  
  app.get('/api', function(req, res){

    //Spit back variables from URL
    for(i in req.query){ console.log(i+": "+req.query[i]); }
    
  });

  app.all('*', function notFound(req, res, next) {
    next(new errors.NotFound);
  });

}
