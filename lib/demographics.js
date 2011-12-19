module.exports = {
    1: { 
        type: 'recipient'
      , text: 'Who is this gift for?'
      , answers: {
            spouse: { text: 'Spouse/Significant Other', next: 2 }
          , friend: { text: 'Friend', next: 3 }
          , parent: { text: 'Parent', next: 4 }
          , sibling: { text: 'Sibling', next: 7 }
          , child: { text: 'Child', next: 5 }
          , enemy: { text: 'Enemy', next: 6 }
        }
    }
  , 2: {
        type: 'gender'
      , text: 'Is your spouse/significant other male or female?'
      , answers: {
            male: { text: 'Male' }
          , female: { text: 'Female' }
        }
    }
  , 3: {
        type: 'gender'
      , text: 'Is your friend male or female?'
      , answers: {
            male: { text: 'Male' }
          , female: { text: 'Female' }
        }
    }
  , 4: {
        type: 'gender'
      , text: 'Is it for your dad or your mom?'
      , answers: {
            male: { text: 'Dad' }
          , female: { text: 'Mom' }
        }
    }
  , 5: {
        type: 'gender'
      , text: 'Is it for your son or your daughter ?'
      , answers: {
            male: { text: 'Son' }
          , female: { text: 'Daughter' }
        }
    }
  , 6: {
        type: 'gender'
      , text: 'Is your enemy male or female?'
      , answers: {
            male: { text: 'Male' }
          , female: { text: 'Female' }
        }
    }
  , 7: {
        type: 'gender'
      , text: 'Is it for your brother or sister?'
      , answers: {
            male: { text: 'Brother' }
          , female: { text: 'Sister' }
        }
    }
};
