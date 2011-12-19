var errors = require('./lib/util/errors')
  , expose = require('express-expose');

module.exports = function routes(app){
  
  var api = require('./routes/api')(app);

  function detectMobile(req, res, next){
    //Mobile detection
    var ua = req.headers['user-agent'],
      $ = {};

    if (/mobile/i.test(ua))
      $.Mobile = true;

    if (/like Mac OS X/.test(ua)) {
      $.iOS = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(ua)[2].replace(/_/g, '.');
      $.iPhone = /iPhone/.test(ua);
      $.iPad = /iPad/.test(ua);
    }

    if (/Android/.test(ua))
      $.Android = /Android ([0-9\.]+)[\);]/.exec(ua)[1];

    if (/webOS\//.test(ua))
      $.webOS = /webOS\/([0-9\.]+)[\);]/.exec(ua)[1];
      

    if (/(Intel|PPC) Mac OS X/.test(ua))
        $.Mac = /(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/.exec(ua)[2].replace(/_/g, '.') || true;

    res.expose({ua: $});
    
    next();
  }

  // routes go here
  app.get('/', detectMobile, function(req, res){
    res.render('index', { title: 'ZiftBot | Find the perfect Zappos gift by answering a few simple questions'} )
  });
  
  app.get('/product/:product_id', detectMobile, function(req, res){
    res.expose( { product_id: req.param('product_id') } );
    res.render('index', { title: 'ZiftBot | Find the perfect Zappos gift by answering a few simple questions'} )
  });
  
  
  app.namespace('/api', function(){
    app.get('/demographics/:question_id', api.getDemographicQuestion);
     
    app.post('/questions/random', api.getRandomQuestion);

    app.post('/questions', api.createQuestion);
  
    app.get('/product/info/:product_id', api.getProduct);
    
    app.get('/product/send', api.sendProduct);
  });


  app.all('*', function notFound(req, res, next) {
    next(new errors.NotFound);
  });

}
