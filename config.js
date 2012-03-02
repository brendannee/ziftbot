var express = require('express')
  , expressNamespace = require('express-namespace')
  , mongoose = require('mongoose')
  , stylus = require('stylus')
  , nib = require('nib')
  , jadevu = require('jadevu')
  , Zappos = require('zappos');
  
  try {
    var keys = require('./keys');
  } catch(e) {
    console.log(e);
  }

require('./models/question');
  
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
    var zapposKey = process.env.ZAPPOS_KEY || keys.zappos;
    app.set('zappos', new Zappos(zapposKey));

    var mongoPass = process.env.MONGO_PW || keys.mongoPass;
    var mongoUser = process.env.MONGO_USER || keys.mongoUser;
    var mongoDB = process.env.MONGO_DB || keys.mongoDB;

    console.log('mongopass:' + mongoPass + ' mongoPass:' + ' mongoUser:' + mongoUser + 'MongoDB:' + mongoDB);
    var db = mongoose.connect('mongodb://'+ mongoUser +':' + mongoPass + '@' + mongoDB);
    app.set('db', db);

    var sendgridPass = process.env.SENDGRID_PW || keys.sendgrid;
    app.set('sendgrid', { username: 'blinktag', password: sendgridPass });

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
