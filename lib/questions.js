module.exports = [
    {
        q: 'Do they like gravy?'
      , a: {
            yes: { text: 'Yes', product: 'http://www.zappos.com/bia-cordon-bleu-gravy-boat-white'}
          , no: { text: 'No'}
        }
      , genders: [ 'male', 'female' ]
      , recipients: [ 'spouse', 'friend', 'parent', 'enemy' ]  
    }
  , {
        q: 'Do they like monkeys?'
      , a: {
            yes: { text: 'Yes', product: 'http://www.zappos.com/product/7930770/color/339823'}
          , no: { text: 'No' }
        }
      , genders: [ 'male', 'female' ]
      , recipients: [ 'spouse', 'friend', 'parent', 'child', 'enemy' ]  
    }
  , {
        q: 'Are they a fan of drinking wine outdoors?'
      , a: {
            yes: { text: 'Yes', product: 'http://www.zappos.com/product/7816851/color/2042' }
          , no: { text: 'No' }
        }
      , genders: [ 'male', 'female' ]
      , recipients: [ 'spouse', 'friend', 'parent', 'enemy' ]  
    }
];
