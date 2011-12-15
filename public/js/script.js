var recipient
  , gender;

$(document).ready(function(){
  //load first question
  $.getJSON('/api/demographics/1', displayDemographics);

  $('#questions').on('click', '.answers a', function(){
    //log answer
    switch($(this).attr('data-type')){
      case 'recipient':
        recipient = $(this).attr('data-value');
        break;
      case 'gender':
        gender = $(this).attr('data-value');
        break;
    }
    
    var next_question = $(this).attr('data-next');
    $.getJSON('/api/demographics/' + next_question, displayDemographics);
    return false;
  });

});

function displayDemographics(data){
  console.log(data);
  if(data.statusCode==200){

    //prepare answers
    var answers = ''
    , answerClass;
    //if two answers, display side-by-side.  If more, display in one column
    if(Object.keys(data.question.a).length > 2){
      answerClass = "multiple";
    } else {
      answerClass = "two";
    }
    
    for(var i in data.question.a){
      var answer = data.question.a[i];
      answers += '<a class="btn large primary ' + answerClass + '" data-next="' + answer.next + '" data-type="' + data.question.type + '" data-value="' + i + '">' + 
        answer.text + 
        '</a>';
    };
    
    //Create div, add stuff then append as a question
    var questionDiv = $('<div/>',{
      class:"question"
    });
    
    $(questionDiv)
      .append($('<div/>',{
        class:"questionText",
        html:data.question.q
      }))
      .append($('<div/>',{
        class:"answers",
        html:answers
      }))
      .appendTo('#questions');
      
      //scroll questions
      var indentation = parseInt($('#questions').css('marginLeft'), 10) - 600;
      $("#questions").animate({
         marginLeft: indentation + 'px',
       }, {
         duration: 'slow',
         easing: 'easeOutQuint'
       });
      
      
  } else {
    console.log('Error retrieving question');
  }
};