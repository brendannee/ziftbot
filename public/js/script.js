var recipient
  , recipientType
  , gender
  , pronoun
  , ignore = []
  , currentVid;

$(document).ready(function(){
  //load first question
  $.getJSON('/api/demographics/1', displayQuestions);

  $('#questions').on('click', '.answers a', function(){
    //stop all playing videos
    try{
      currentVid.pause();
    }
    catch(e){
    }
    
    //log answer
    logDemographics($(this).attr('data-type'), $(this).attr('data-value'));
    
    //if reset, then clear all old variables and divs
    if( $(this).attr('data-type') == 'reset' ) {
      resetQuestions($(this).parents('.question')[0]);
    }
    
    var next_question = $(this).attr('data-next')
      , next_div = $(this).parents('.question').next();
    if(next_question != 'undefined' && next_question){
      //do next demographic question
      $.getJSON('/api/demographics/' + next_question, displayQuestions);
    } else if( $(this).attr('data-type') == 'product' ) {
      //show product
      return true;
      
    } else if( $(this).attr('data-value') == 'yes' ) {
      //product page is pre-rendered
      scrollQuestions();
      
      //render videoJS and start video, if the next question contains a video
      if($('video', next_div).length){
        currentVid.play();
      }
    } else {
      //do product questions
      
      //remove pre-rendered product in next sibling div
      next_div.remove();
      
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
  
  $('#reset').on('click', function(){
    resetQuestions($('#questions .question')[0]);
    
    $.getJSON('/api/demographics/1', displayQuestions);
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
        capitaliseFirstLetter(answer.text.replace('{{pronoun}}', pronoun)) + 
        '</a>';
        if(answer.product){
          product_id = answer.product;
        }
    };
    
    //Create div, add stuff then append as a question
    $('#questions')
      .append(
        '<div class="question">' +
        '<div class="questionText">' + data.q.replace('{{pronoun}}', pronoun) + '</div>' +
        '<div class="answers">' + answers + '</div>' +
        '</div>'
      );
      
    //scroll questions
    scrollQuestions();
    
    //now lookup product info to preload product div
    if(product_id){
      $.getJSON('/api/product/' + product_id, function(data){
        var product = data[0]
          , style = product.styles[0]
          , video = {}
          , media;
        console.log(data);
        
        $.each(product.videos, function(i, value){
          if(value.videoEncodingExtension == 'mp4'){
            video.mp4 = value.filename;
          } else if(value.videoEncodingExtension == 'flv'){
            video.flv = value.filename;
          }
        });
        console.log(video);
        if(video.mp4){
          media = '<div class="video-js-box vim-css">' +
                  '<video id="video-' + product.productId + '" width="550" height="306" controls>' +
                    '<source src="' + video.mp4 + '"  type="video/mp4" />' +
                    '<object width="640" height="360" type="application/x-shockwave-flash" data="' + video.swf + '">' + 
                      '<param name="movie" value="' + video.swf + '" />' +
                      '<param name="flashvars" value="autostart=true&amp;controlbar=over&amp;image=' + style.imageUrl + '&amp;file=' + video.mp4 + '" />' +
                    '</object>' +
                  '</video>' +
                  '</div>';
        } else {
          media = '<div class="productImage">' +
            '<img src="' + style.imageUrl + '" alt="' + product.brandName + ' ' + product.productName + '">' +
            '</div>';
        }

        
        $('#questions')
          .append(
            '<div class="question product" id="' + product.productId + '">' +
            '<div class="questionText">Would your ' + recipientType + ' like a ' + product.brandName + ' ' + product.productName + '?</div>' +
            media +
            '<div class="productInfo">' + style.price + '</div>' +
            '<div class="answers">' +
            '<a href="' + product.defaultProductUrl + '" title="' + product.brandName + ' ' + product.productName + '" class="btn large primary two" data-type="product">Yes!</a>' +
            '<a class="btn large primary two" data-type="question">No, ask me more questions</a>' +
            '</div>' +
            '</div>'
          );
          
        //render video, if present
        if(video.mp4){
          currentVid = VideoJS.setup('video-' + product.productId);
        }
        
      });
    }
   
      
  } else {
    console.log(textStatus + ' Error retrieving question');
  }
};

function questionError(jqXHR, textStatus) {
  if(jqXHR.status == 402){
    $('#questions')
      .append(
        '<div class="question">' +
        '<div class="questionText">Thats all the gift ideas we\'ve got.  Would you like to try again?</div>' +
        '<div class="answers">' +
        '<a class="btn large primary" data-next="1" data-type="reset" >Sure, why not?</a>' +
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

function resetQuestions(currentDiv) {
  recipient = '';
  gender = '';
  ignore = [];
  $('#questions').find('.question').not($(currentDiv)).remove();
  
  $('#questions').css('marginLeft',0);
}

function logDemographics(type, value) {
  switch(type){
    case 'recipient':
      recipient = value;
      break;
    case 'gender':
      gender = value;
      pronoun = (gender == 'male') ? 'he' : 'she';
      switch(recipient){
        case 'friend':
          recipientType = 'friend';
          break;
        case 'spouse':
          recipientType = 'lover';
          break;
        case 'parent':
          recipientType = (gender == 'male') ? 'dad' : 'mom';
          break;
        case 'child':
          recipientType = (gender == 'male') ? 'son' : 'daughter';
          break;
        case 'enemy':
          recipientType = 'enemy';
          break;
      }
      break;
  }
}

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}