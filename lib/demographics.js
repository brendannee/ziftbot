module.exports = {
    1: { 
        type: 'recipient'
      , q: 'Who is this gift for?'
      , a: {
            spouse: { text: 'Spouse/Significant Other', next: 2 }
          , friend: { text: 'Friend', next: 3 }
          , parent: { text: 'Parent', next: 4 }
          , child: { text: 'Child', next: 5 }
          , enemy: { text: 'Enemy', next: 6 }
        }
      }
    , 2: {
        type: 'gender'
      , q: 'Is your spouse/significant other male or female?'
      , a: {
            male: { text: 'Male' }
          , female: { text: 'Female' }
        }
      }
    , 3:{
        type: 'gender'
      , q: 'Is your friend male or female?'
      , a: {
            male: { text: 'Male' }
          , female: { text: 'Female' }
        }
      }
    , 4:{
        type: 'gender'
      , q: 'Is it for your dad or your mom?'
      , a: {
            male: { text: 'Dad' }
          , female: { text: 'Mom' }
        }
      }
    , 5:{
        type: 'gender'
      , q: 'Is it for your son or your daughter ?'
      , a: {
            male: { text: 'Son' }
          , female: { text: 'Daughter' }
        }
      }
    , 6:{
        type: 'gender'
      , q: 'Is your enemy male or female?'
      , a: {
            male: { text: 'Male' }
          , female: { text: 'Female' }
        }
      }
};
