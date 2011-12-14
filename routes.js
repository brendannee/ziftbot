var errors = require('./lib/util/errors');

module.exports = function routes(app){

  // routes go here
  app.get('/', function(req, res){
    res.render('index', { title: 'Gifter'})
  });
  
  
  app.get('/api', function(req, res){

    //Spit back variables from URL
    for(i in req.query){ console.log(i+": "+req.query[i]); }
    
  });

  app.all('*', function notFound(req, res, next) {
    next(new errors.NotFound);
  });

}