var recipient
  , recipientType
  , gender
  , pronoun
  , posessiveAdjective
  , ignore = []
  , currentVid;

$(document).ready(function(){
  //configure modal window
  $('#sendForm').modal({backdrop:'static'});

  //load first question, unless express.product_id is present
  if(express.product_id){
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
  
  $('#questions').on('click', '#emailProduct', function(){
    $('#sendForm').modal('show');
    return false;
  });

  $('#sendForm').on('click', '.primary', function(){
    $(this).attr('disabled', 'disabled');
      $.ajax({
          url: '/api/product/send'
        , type: 'get'
        , dataType: 'json'
        , data: {
            to: $('#to').val()
          , sender: $('#sender').val()
          , firstName: capitaliseFirstLetter($('#firstName').val())
          , lastName:  capitaliseFirstLetter($('#lastName').val())
          , message: $('#message').val()
          , product_id: $(this).attr('data-product')
          }
        , success: function(data){ 
            console.log(data); 
            if(data==true){
              $('#sendForm .primary').html('Sent');
              setTimeout(function(){ $('#sendForm').modal('hide'); }, 800);
            }
          }
        , error: function(){
          $('#sendForm .primary').removeAttr('disabled');
        }
      });
      return false;
  });
  
  
  $('#sendForm').bind('hide', function(){
    //reset form
    $('#sendForm .primary').removeAttr('disabled');
    $('#sendForm input').val('');
    $('#sendForm textarea').val('');
    $('#sendForm .primary').html('Send')
  });
    
  
  $('.modal-footer').on('click', '.close-modal', function(){
    $('#sendForm').modal('hide');
  });


});

function nextScreen(){
  
  //stop all playing videos
  try{
    currentVid.pause();
  }
  catch(e){
  }
    
  //Hide send button
  $('#emailProduct').fadeOut();
  
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
  
  if( $(this).attr('data-type') == 'product') {
    //leave this link alone
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
    
    $('#emailProduct').fadeIn();
      
    //render videoJS and start video, if the next question contains a video
    if($('video', next_div).length){
      currentVid.play();
    }
  } else {
    //do product questions
    //show recipient reset
    $('#recipientBox').slideDown();
    
      
    //remove pre-rendered product in next sibling div
    next_div.remove();
      
    $.ajax({
        url: '/api/questions/random'
      , type: 'post'
      , dataType: 'json'
      , data: {
          recipients: recipient
        , genders: gender
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
  if (question._id) {
    ignore.push(question._id);
  }
  
  // Replace text with proper wording
  question.text = mustache(question.text, {
      pronoun: pronoun
    , posessiveAdjective: posessiveAdjective
    , recipientType: recipientType
  });
  question.type = question.type || false;
  question.answers = question.answers || false;
  question.yes = question.yes ? mustache(question.yes, { pronoun: pronoun }) : null;
  question.no = question.no ? mustache(question.no, { pronoun: pronoun }): null;
  question.product = question.product || null;

  template('question', question).appendTo('#questions');
  
  scrollQuestions();

  if (question.product) {
    console.log(question.product);

    $('#questions').append('<div class="question product">');
    
    $.getJSON('/api/product/info/' + question.product, renderProduct);
  }

}

function renderProduct(product) {
  console.log(product);
  if(product) {

    var product = product[0]
      , $product
      , $media;

    product.recipientType = recipientType;
    product.price = (product.styles.length) ? product.styles[0].price : '';
    product.imageSrc = (product.styles.length) ? product.styles[0].imageUrl : '';
    
    //if not mobile, then show videos, otherwise we'll do images
    if(!express.ua.Mobile && !express.ua.iPhone && !express.ua.iPad && !express.ua.Android && !express.ua.iPod && !express.ua.webOS) {
      $.each(product.videos, function(i, value) {
        if (value.videoEncodingExtension == 'mp4') {
          product.mp4 = value.filename;
        } else if (value.videoEncodingExtension == 'flv') {
          product.swf = value.filename;
        }
      });
    }

    $media = (product.mp4) ? template('video', product) : template('image', product);

    $product = template('product', product);
    $product.find('.questionText').after($media);
    $('#questions .question:last-child').html($product);
  
    // Render video, if present
    if (product.mp4) {
      VideoJS.DOMReady(function(){
        currentVid = VideoJS.setup('video-' + product.productId);
      });
    }
  
    //if we're on a product page, start video
    if(express.product_id){
      setTimeout(function(){currentVid.play();}, 1000);
    }
    
    //add id to email form
    $('#sendForm .primary').attr('data-product', product.productId);
    $('#sendForm h3').html('Send ' + product.brandName + ' ' + product.productName + ' to a friend');
    
    //add info to tweet button
    var tweetText = 'I just found ' + product.brandName + ' ' + product.productName + ' http://ziftbot.com/product/' + product.productId + ' on Ziftbot';
    $('#tweetProduct')
      .attr('href', 'http://twitter.com/home/?status=' + encodeURIComponent(tweetText))
      .attr('title', 'Tweet ' + product.brandName + ' ' + product.productName);
  } else {
    //product no longer exists, so get a new question
    $('#questions .question:last-child').remove();
    nextScreen();
  }
  
}

function questionError(jqXHR, textStatus) {
  if (jqXHR.status == 402) {
    var error = {
        q: 'We\'re out of ideas.  Would you like to try ZiftBot again?'
      , a: [{ next: 1, text: 'Yes' }]
      , type: 'reset'
      , product: null
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
     easing: 'easeOutQuint',
     complete: function(){
       //check if indentation is less than
       if( parseInt($('#questions').css('marginLeft'), 10) % parseInt($('#questionsFrame').css('width'), 10) != 0){
         console.log('test');
         var newIndentation = Math.floor(parseInt($('#questions').css('marginLeft'), 10) / parseInt($('#questionsFrame').css('width'), 10)) * parseInt($('#questionsFrame').css('width'), 10);
         $('#questions').css('marginLeft',newIndentation);
       }
     }
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
      $('#recipientBox .recipient').html(recipientType);
      
      break;
  }
}

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
