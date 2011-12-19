var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var Question = new Schema({
    text: { type: String, required: true }
  , yes: { type: String, required: true, default: 'Yes' }
  , no: { type: String, required: true, default: 'No' }
  , genders: { type: [ String ], default: [ 'male', 'female' ] }
  , recipients: { type: [ String ], default: [ 'spouse', 'friend', 'sibling', 'parent', 'enemy' ] }
  , product: { type: String }
  , random: { type: Number, default: Math.random }
});

mongoose.model('Question', Question);
