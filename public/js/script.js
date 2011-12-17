var recipient
  , recipientType
  , gender
  , pronoun
  , posessiveAdjective
  , ignore = []
  , currentVid;

$(document).ready(function(){

  //load first question, unless URL has product ID
  if(document.location.pathname.split('/')[1] == 'product'){
    $.getJSON('/api/product/info/' + document.location.pathname.split('/')[2], renderProduct);
  } else {
    nextScreen();
  }

  $('#questions').on('click', '.answers a', nextScreen);
  
  $('#reset').on('click', function(){
    resetQuestions($('#questions .question')[0]);
    
    $.getJSON('/api/demographics/1', displayQuestion);
    return false;
  });

  $('#sendProduct').on('click', function(){
    $.getJSON('/api/product/send', {
        to: 'brendan@blinktag.com'
      , firstName: capitaliseFirstLetter('Brendan')
      , lastName:  capitaliseFirstLetter('Nee')
      , message: 'Test message'
      , product_id: 7766192
      }, function(data){ console.log(data); });
    
    return false;
  });


});

function nextScreen(){
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
  
  //remove history
  if ( Modernizr.history ) {
    history.pushState({}, 'Ziftbot', '/');
  }
    
  var next_question = $(this).attr('data-next')
    , next_div = $(this).parents('.question').next();
  
  if( $(this).attr('data-type') == 'product' ) {
    //show product
    return true;
  } else if(!gender && !recipient) {
    //start demographic questions
    $.getJSON('/api/demographics/1', displayQuestion);
  } else if(next_question != 'undefined' && next_question) {
    //do next demographic question
    $.getJSON('/api/demographics/' + next_question, displayQuestion);
  } else if( $(this).attr('data-value') == 'yes' ) {
    //product page is pre-rendered, update history and scroll question
    if ( Modernizr.history ) {
      productID = $(this).attr('data-product');
      history.pushState({ productID: productID}, productID, 'product/' + productID)
    }
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
      , success: displayQuestion
      , error: questionError
    });
  }
    
  return false;
  
}

function mustache(str, obj) {
  var rex = /\{\{[^\s]+\}\}/g;
  var matches = str.match(rex);
  
  if (matches) {
    for (var i = matches.length - 1; i >= 0; i--){
      var key = matches[i].replace(/\{\{|\}\}/g,'');
      if (typeof(obj[key]) !== "undefined") {
        str = str.replace(matches[i],obj[key]);
      }
    }
  }
  return str;
}

function displayQuestion(question) {
  console.log(question);
  
  // Log question as seen
  if (question.id) {
    ignore.push(question.id);
  }
  
  // Replace text with proper wording
  question.q = mustache(question.q, {
      pronoun: pronoun
    , posessiveAdjective: posessiveAdjective
    , recipientType: recipientType
  });

  $.each(question.a, function(i, answer) {
    answer.text = mustache(answer.text, {
        pronoun: pronoun
    });
  });
  
  if ( !question.product ) {
    question.product = null;
  }

  template('question', question).appendTo('#questions');

  //scroll questions
  scrollQuestions();

  if (question.product) {
    console.log(question.product);
    $.getJSON('/api/product/info/' + question.product, renderProduct);
  }

}

function renderProduct(product) {
  console.log(product);

  var product = product[0]
    , $product
    , $media;

  product.recipientType = recipientType;
  product.price = (product.styles.length) ? product.styles[0].price : '';
  product.imageSrc = (product.styles.length) ? product.styles[0].imageUrl : '';
  
  $.each(product.videos, function(i, value) {
    if (value.videoEncodingExtension == 'mp4') {
      product.mp4 = value.filename;
    } else if (value.videoEncodingExtension == 'flv') {
      product.swf = value.filename;
    }
  });

  $media = (product.mp4) ? template('video', product) : template('image', product);

  $product = template('product', product);
  $product.find('.questionText').after($media);
  $product.appendTo('#questions');
  
  // Render video, if present
  if (product.mp4) {
    currentVid = VideoJS.setup('video-' + product.productId);
  }
  
  //if we're on a product page, scroll questions
  if(document.location.pathname.split('/')[1] == 'product'){
    scrollQuestions();
  }
  
}

function questionError(jqXHR, textStatus) {
  if (jqXHR.status == 402) {
    var error = {
        q: 'We\'re out of ideas.  Would you like to try ZiftBot again?'
      , a: [{ next: 1, text: 'Yes' }]
      , type: 'reset'
    };

    template('question', error).appendTo('#questions');
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
      //update template
      $('.recipientBox .recipient').html(recipient);
      
      break;
    case 'gender':
      gender = value;
      pronoun = (gender == 'male') ? 'he' : 'she';
      posessiveAdjective = (gender == 'male') ? 'his' : 'her';
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
        case 'sibling':
          recipientType = (gender == 'male') ? 'brother' : 'sister';
          break;
        case 'child':
          recipientType = (gender == 'male') ? 'son' : 'daughter';
          break;
        case 'enemy':
          recipientType = 'enemy';
          break;
      }
      //update template
      $('.recipientBox .recipient').html(recipientType);
      
      break;
  }
}

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
