module.exports = [
    {
        q: 'Does {{pronoun}} like gravy?'
      , a: {
            yes: { text: 'Yes', product: 7929500 }
          , no: { text: 'No'}
        }
      , genders: [ 'male', 'female' ]
      , recipients: [ 'spouse', 'friend', 'parent', 'enemy' ]  
    }
  , {
        q: 'Do they like monkeys?'
      , a: {
            yes: { text: 'Yes', product: 7930770 }
          , no: { text: 'No' }
        }
      , genders: [ 'male', 'female' ]
      , recipients: [ 'spouse', 'friend', 'parent', 'child', 'enemy' ]  
    }
  , {
        q: 'Is {{pronoun}} a fan of drinking wine outdoors?'
      , a: {
            yes: { text: 'Yes', product: 7816851 }
          , no: { text: 'No' }
        }
      , genders: [ 'male', 'female' ]
      , recipients: [ 'spouse', 'friend', 'parent', 'enemy' ]  
    }
  , {
        q: 'Would {{pronoun}} enjoy being covered in caramel?'
      , a: {
            yes: { text: 'Oh yeah', product: 7648933 }
          , no: { text: 'Not sure' }
        }
      , genders: [ 'male', 'female' ]
      , recipients: [ 'spouse', 'enemy' ]  
    }
  , {
        q: 'Do they like fancy bath stuff?'
      , a: {
            yes: { text: 'Yes, they do', product: 7762100 }
          , no: { text: 'No' }
        }
      , genders: [ 'male', 'female' ]
      , recipients: [ 'spouse', 'friend', 'parent', 'enemy' ]   
    }
  , {
        q: 'How about chocolate + massage?'
      , a: {
            yes: { text: '{{pronoun}}\'d like that', product: 7648937 }
          , no: { text: 'Nope' }
        }
      , genders: [ 'male', 'female' ]
      , recipients: [ 'spouse' ]  
    }
  , {
        q: 'Does {{pronoun}} ever have difficulty pitting olives and cherries?'
      , a: {
            yes: { text: 'As a matter of fact, {{pronoun}} does', product: 7918248 }
          , no: { text: 'No' }
        }
      , genders: [ 'male', 'female' ]
      , recipients: [ 'spouse', 'friend', 'parent', 'enemy' ] 
    }

];
