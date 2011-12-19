
var boot = module.exports = require('./boot')
  , app = require('express').createServer();

console.log = require('logging').from(__dirname);

module.exports = boot(app);

if (!module.parent) {
  var port = process.env.PORT || 8080;
  app.listen(port, function(){
    console.error('\x1b[32m' + app.set('domain') + '\x1b[0m running on port %d',
      app.address().port);
  });
  
}
