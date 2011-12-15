var errors = require('./lib/util/errors');

module.exports = function routes(app){
  
  var api = require('./routes/api')(app);

  // routes go here
  app.get('/', function(req, res){
    res.render('index', { title: 'ZiftBot'})
  });
  
  app.namespace('/api', function(){
    app.get('/demographics/:question_id', api.getDemographics);
     
    app.get('/questions', api.getQuestions);
  
    app.get('/product/:product_id', api.getProduct);
  });


  app.all('*', function notFound(req, res, next) {
    next(new errors.NotFound);
  });

}
