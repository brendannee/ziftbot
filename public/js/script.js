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
			$.ajax({
			  	url: '/api/questions'
			  ,	dataType: 'json'
				, data: {
        	  recipient: recipient
       	 	, gender: gender
					, ignore: ignore.join(',')
        	}
			  , success: displayQuestions
				, error: questionError
			});
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
    $('<div/>',{ class:"question" })
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
    	scrollQuestions();
      
      
  } else {
    console.log(textStatus + ' Error retrieving question');
  }
};

function questionError(jqXHR, textStatus) {
	if(jqXHR.status == 402){
		//out of questions, so clear all variables 
		recipient = '';
		gender = '';
		ignore = [];
		
    $('#questions').append('<div class="question">' +
      '<div class="questionText">Thats all the gift ideas we\'ve got.  Would you like to try again?</div>' +
			'<div class="answers">' +
			'<a class="btn large primary" data-next="1" >Sure, why not?</a>' +
			'</div>'
		);
			  
		scrollQuestions();
		
	} else {
		console.log(jqXHR);
	}
}

function scrollQuestions(){
  var indentation = parseInt($('#questions').css('marginLeft'), 10) - parseInt($('#questionsFrame').css('width'), 10);
  $("#questions").animate({
     marginLeft: indentation + 'px',
  }, {
     duration: 'slow',
     easing: 'easeOutQuint'
  });
}