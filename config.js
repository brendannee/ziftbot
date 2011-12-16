var express = require('express')
  , expressNamespace = require('express-namespace')
  , stylus = require('stylus')
  , nib = require('nib')
  , jadevu = require('jadevu')
  , Zappos = require('zappos');
  
module.exports = function(app) {
  
  
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

  app.configure(function() {
    var key = process.env.ZAPPOS_KEY || require('./key');
    app.set('zappos', new Zappos(key));

    this.use(express.cookieParser())
        .use(express.bodyParser())
        .set('views', __dirname + '/views')
        .set('view engine', 'jade')
        .set('public', __dirname + '/public')
        .enable('error templates')
        .use(express.static(this.set('public')))
        .use('/css', stylus.middleware({
            force: true
          , compress: true
          , debug: true
          , src: __dirname + '/styles'
          , dest: this.set('public') + '/css'
          , compile: function(str, path) {
              return stylus(str)
                .set('filename', path)
                .set('paths', ['/style'])
                .use(nib());
            }
        }))
  });

  
}
