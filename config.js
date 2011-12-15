var express = require('express');
  
module.exports = function(app) {
  
  app.configure(function() {
    this.use(express.cookieParser())
        .use(express.bodyParser())
        .set('views', __dirname + '/views')
        .set('view engine', 'jade')
        .set('public', __dirname + '/public')
        .enable('error templates')
        .use(express.static(__dirname + '/public'))
  });

  app.configure('development', function(){
    this
      .use(express.logger('\x1b[90m:remote-addr -\x1b[0m \x1b[33m:method\x1b[0m' +
         '\x1b[32m:url\x1b[0m :status \x1b[90m:response-time ms\x1b[0m'))
      .use(express.errorHandler({dumpExceptions: true, showStack: true}))
      .enable('dev')
      .set('domain', 'test.ziftbot.com');
  });
  
  app.configure('production', function(){
    this
      .use(express.logger({buffer: 10000}))
      .use(express.errorHandler())
      .enable('prod')
      .set('domain', 'ziftbot.com');
  });  
  
}
