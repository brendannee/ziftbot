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
    if(next_question != 'undefined' && next_question){
      //do next demographic question
      $.getJSON('/api/demographics/' + next_question, displayQuestions);
    } else if( $(this).attr('data-type') == 'product' ) {
      //show product
      return true;
      
    } else if( $(this).attr('data-value') == 'yes' ) {
      //product page is pre-rendered
      scrollQuestions();
      
    } else {
      //do product questions
      
      //remove pre-rendered product in next sibling div
      $(this).parents('.question').next().remove();
      
      $.ajax({
          url: '/api/questions'
        , dataType: 'json'
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
      , answerClass
      , product_id;
    //if two answers, display side-by-side.  If more, display in one column
    if(Object.keys(data.a).length > 2){
      answerClass = "multiple";
    } else {
      answerClass = "two";
    }
    
    for(var i in data.a){
      var answer = data.a[i];
      answers += '<a class="btn large primary ' + answerClass + '" data-next="' + answer.next + '" data-type="' + data.type + '" data-value="' + i + '" data-product="' + answer.product + '">' + 
        answer.text + 
        '</a>';
        if(answer.product){
          product_id = answer.product;
        }
    };
    
    //Create div, add stuff then append as a question
    $('#questions')
      .append(
        '<div class="question">' +
        '<div class="questionText">' + data.q + '</div>' +
        '<div class="answers">' + answers + '</div>' +
        '</div>'
      );
      
    //scroll questions
    scrollQuestions();
    
    //now lookup product info to preload product div
    if(product_id){
      $.getJSON('/api/product/' + product_id, function(data){
        var product = data[0];
        console.log(data);
        $('#questions')
          .append(
            '<div class="question product">' +
            '<div class="questionText">Would your friend like a ' + product.brandName + ' ' + product.productName + '?</div>' +
            '<div class="productImage"><img src="' + product.defaultImageUrl + '" alt="' + product.brandName + ' ' + product.productName + '"></div>' +
            '<div class="answers">' +
            '<a href="' + product.defaultProductUrl + '" title="' + product.brandName + ' ' + product.productName + '" class="btn large primary" data-type="product">Yes!</a>' +
            '<a class="btn large primary" data-type="question">No, ask me more questions</a>' +
            '</div>' +
            '</div>'
          );
        
      });
    }
   
      
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
    
    $('#questions')
      .append(
        '<div class="question">' +
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