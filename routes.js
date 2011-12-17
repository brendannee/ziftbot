var errors = require('./lib/util/errors');

module.exports = function routes(app){
  
  var api = require('./routes/api')(app);

  // routes go here
  app.get('/', function(req, res){
    res.render('index', { title: 'ZiftBot | Find the perfect Zappos gift by answering a few simple questions'})
  });
  
  app.get('/product/:product_id', function(req, res){
    res.render('index', { title: 'ZiftBot | Find the perfect Zappos gift by answering a few simple questions', product_id: req.param('product_id') } )
  });
  
  
  app.namespace('/api', function(){
    app.get('/demographics/:question_id', api.getDemographics);
     
    app.get('/questions', api.getQuestions);
  
    app.get('/product/info/:product_id', api.getProduct);
    
    app.get('/product/send', api.sendProduct);
  });


  app.all('*', function notFound(req, res, next) {
    next(new errors.NotFound);
  });

}
