var recipient
  , gender
  , ignore = [];

$(document).ready(function(){
  //load first question
  $.getJSON('/api/demographics/1', displayQuestions);

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
    if(next_question != 'undefined'){
      //do next demographic question
      $.getJSON('/api/demographics/' + next_question, displayQuestions);
    } else {
      //start product questions
      $.getJSON('/api/questions', {
        recipient: recipient,
        gender: gender,
				ignore: ignore.join(',')
        }, displayQuestions);
    }
    
    return false;
  });

});

function displayQuestions(data, textStatus, jqXHR){
  console.log(data);
  if(textStatus=='success'){
	  
	 	//Log question as seen
		if(data.id != undefined){
			ignore.push(data.id);
		}

    //prepare answers
    var answers = ''
    , answerClass;
    //if two answers, display side-by-side.  If more, display in one column
    if(Object.keys(data.a).length > 2){
      answerClass = "multiple";
    } else {
      answerClass = "two";
    }
    
    for(var i in data.a){
      var answer = data.a[i];
      answers += '<a class="btn large primary ' + answerClass + '" data-next="' + answer.next + '" data-type="' + data.type + '" data-value="' + i + '">' + 
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
        html:data.q
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
    console.log(textStatus + ' Error retrieving question');
  }
};