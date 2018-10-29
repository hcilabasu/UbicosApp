var current_pagenumber = 1 //initial page number; gets updated with page change
var type = '' //card type



window.onerror = function(message, file, line) {
  console.log('An error occured at line ' + line + ' of ' + file + ': ' + message);
  enterLogIntoDatabase('error', 'error' , 'An error occured at line ' + line + ' of ' + file + ': ' + message, 9999)
  //alert('an error')
  return false;
};

/*
    This variable is key in the functioning of the page navigation functionality.
    It is also used in:
    * activityindex.js
*/
var NUM_PAGES = 15;


$(function(){

    var host_url = window.location.host

    console.log('page load');

    $('.close-card').on('touch click', function(){

        var classNameWhichisClosed = $(this).offsetParent()[0].className.split(" ")[1]
        //user logging
        enterLogIntoDatabase('card close', classNameWhichisClosed, 'none', current_pagenumber)
        $(this).closest('.card').removeClass('active');
    });

    $('.extend-card').on('touch click', function(){

        var width = $(".card").width() / $('.card').parent().width() * 100
        width = width/2;

        if (width == 50){
            $('.card').css({'width':'100%'});
        }else{
            $('.card').css({'width':'50%'});
        }

    });



    //update activity feed with history of messages
    loadFeed(); //call function from activity.js

    // Load first pages
    // TODO the URL should indicate which page to be loaded instead of always loading pages 1 and 2
    loadPage(1, $('.page:not(.previous):not(.next)'));
    loadPage(2, $('.page.next'));

    // If we start loading the cards dynamically, this needs to be called after the brainstorm card is built
    setupBrainstorm();

    loadActivityIndex();

    //toggle between activity feed and index
    $('#main-view-toggle').click(function(){
        var hidden = $('.main-view:hidden');
        $('.main-view:visible').fadeOut('fast', function(){
            hidden.fadeIn('fast');
        });
        $(this).toggleClass('pressed');
        //TODO: add user log
    });

    //check localstorage - used for refresh

      if(localStorage.getItem("pageToBeRefreshed")){

        var pageToBeRefreshed = localStorage.getItem("pageToBeRefreshed");

        var gotoPage = pageToBeRefreshed;
        var container = $('#textbook-content');

        // Update current page
        loadPage(
            gotoPage,
            $('.page:not(.previous):not(.next)'),
            function(){
                // Update container class if this is the last or the first page
                var containerClass = ''
                if(gotoPage == 1) containerClass = 'first';
                else if(gotoPage == NUM_PAGES) containerClass = 'last'; // NUM_PAGES is defined in digTtextBook.js
                container.attr('class',containerClass);
                // Change page number
                $("#page-control-number").text('Page ' + gotoPage + '/' + NUM_PAGES);
            });
        // Update previous and next
        loadPage(parseInt(gotoPage)+1, $('.page.next'));
        loadPage(gotoPage-1, $('.page.previous'));

      }else{

      }






});


var movePage = function(moveToNext){


    var container = $('#textbook-content'),
        pageToHide = $('.page:not(.previous):not(.next)', container), // This the current page, which will be hidden
        pageToShow, // This is the page that will be shown next
        pageToReplace, // this is the page whose content will need to be updated
        currentNewClass, // this is the new class that will be applied to the current page
        currentPageNum, // Page number of the page that will be shown
        replacePageNum, // Number of the new page to be dynamically loaded
        noMoreClass; // Class that will be added to container if 
    if(moveToNext === true){
        pageToShow = $('.page.next', container);
        pageToReplace = $('.page.previous', container);
        currentNewClass = 'previous';
        replaceNewClass = 'next';
        currentPageNum = parseInt(pageToShow.data('page'));
        replacePageNum = currentPageNum + 1;
        noMoreClass = 'last';
    } else {
        pageToShow = $('.page.previous', container);
        pageToReplace = $('.page.next', container);
        currentNewClass = 'next';
        replaceNewClass = 'previous';
        currentPageNum = parseInt(pageToShow.data('page'));
        replacePageNum = currentPageNum - 1;
        noMoreClass = 'first';
    }
    // Replace page number
    console.log("current page", currentPageNum)
    current_pagenumber = currentPageNum
    localStorage.setItem("pageToBeRefreshed", currentPageNum);
    $("#page-control-number").text('Page ' + currentPageNum + '/' + NUM_PAGES);
    //user logging
    enterLogIntoDatabase('click', 'page change' , 'none', current_pagenumber)

    //close any card with page navigation
    if(type!=''){
        $('.card.' + type).removeClass('active');
    }



    // Do swaps
    pageToHide.attr('class','page').addClass(currentNewClass); // Turn the current page into either next or previous
    pageToShow.attr('class','page');
    pageToReplace.attr('class','page').addClass(replaceNewClass);

    // Replace page to replace content
    loadPage(
        replacePageNum, 
        pageToReplace, 
        function(){
            container.attr('class','');
        },
        function(){
            container.attr('class', noMoreClass);
        });
};

var loadPage = function(pageNum, pageContainer, successFn, notFoundFn){
    console.log('next page (loadPage Function)', pageNum)

    loadHTML(
        API_URL.pagesBase + '/' + pageNum + '.html',
        function(data){

            var pageHTML = $(data) //convert data into jquery object

            //console.log(pageHTML)

            if($('img', pageHTML)){

                var imgsrc = $('img', pageHTML).attr('src') //get the image src from the html i.e. '/act2/1.png'
                $('img', pageHTML).attr('src', API_URL.picsBase + imgsrc); //append the base url in the front
            }

            pageContainer.html(pageHTML);
            pageContainer.data('page', pageNum);

            if(successFn){
                successFn();
            }

            bindActivityButtons();
        },
        function (xhr, ajaxOptions, thrownError){
            if(xhr.status==404) {
                console.dir('Page not found');
                if (notFoundFn){
                    notFoundFn();
                }
            }
        }
    );
}

var loadHTML = function(url, successFn, errorFn){
    $.ajax({
        method: 'GET',
        url: url,
        success:successFn,
        error:errorFn
    });
};



var bindActivityButtons = function(){

    $('input#page4-submit1').off().click(function(e){

         //change the button appearance
         $(this).css('background-color', '#A0A0A0'); //change the border to show that button is clicked.
         $(this).css('outline', 'none');

         //get the user response
         var answer = $("textarea[name='page4-input1']").val();
         $("textarea[name='page4-input1']").attr('value', answer)
         //console.log(answer);

         var jsonObj = [];

        //handle empty input
        if(!answer.trim()){
            console.log('answer is empty')
            isAnswerNull = 1;
        }

        jsonObj.push(answer.trim());

        jsonObj = JSON.stringify(jsonObj);
        //console.log(jQuery.type(jsonObj));

        //make an ajax call into database
        console.log('isAnswerNull value :: ', isAnswerNull)
        if(isAnswerNull == 1){

            modal = $("#myModal")
            console.log(modal)

            $("#myModal").css({ display: "block"});

            $("#myModal h2").text("one of the inputs is empty");

            $(".modal-close").click(function(e){
                 $("#myModal").css({ display: "none" });
            });

            isAnswerNull = 0;


        }else{
               $.post({

               async: false,
               url:'/submitAnswer',
               data: {
                    'page': 4,
                    'answer': jsonObj
                    },
               success: function(response){

                    //open success modal here.
                modal = $("#myModal")
                console.log(modal)

                $("#myModal").css({ display: "block" });
                $("#myModal h2").text("Your response was recorded");

                $(".modal-close").click(function(e){
                     $("#myModal").css({ display: "none" });
                });


            }

            });
        }


    });

     $('#page4-submit2').off().click(function(e){
         //change the button appearance
         $(this).css('background-color', '#A0A0A0'); //change the border to show that button is clicked.
         $(this).css('outline', 'none');

         //get the user response
         var answer = $("textarea[name='page4-input2']").val();
         $("textarea[name='page4-input2']").attr('value', answer)
         //console.log(answer);

         var jsonObj = [];

        //handle empty input
        if(!answer.trim()){
            console.log('answer is empty')
            isAnswerNull = 1;
        }

        jsonObj.push(answer.trim());

        jsonObj = JSON.stringify(jsonObj);
        //console.log(jQuery.type(jsonObj));

        //make an ajax call into database
        console.log('isAnswerNull value :: ', isAnswerNull)
        if(isAnswerNull == 1){

            modal = $("#myModal")
            console.log(modal)

            $("#myModal").css({ display: "block"});

            $("#myModal h2").text("one of the inputs is empty");

            $(".modal-close").click(function(e){
                 $("#myModal").css({ display: "none" });
            });

            isAnswerNull = 0;


        }else{
               $.post({

               async: false,
               url:'/submitAnswer',
               data: {
                    'page': 4,
                    'answer': jsonObj
                    },
               success: function(response){

                    //open success modal here.
                modal = $("#myModal")
                console.log(modal)

                $("#myModal").css({ display: "block" });
                $("#myModal h2").text("Your response was recorded");

                $(".modal-close").click(function(e){
                     $("#myModal").css({ display: "none" });
                });


            }

            });
        }
    });

    $('.page a').off().on('touch click', function(){
        // Get button type to open appropriate view
        //console.log('this', this)
        //console.log('$(this)', $(this))

        var activityButton = $(this);

        //type of activity - gallery/brainstorm/video etc
        type = activityButton.attr('class').replace('activity-button','').trim();
        console.log('type', type)

        //id of each each activity - based on page no
        var id = activityButton.attr('data-id');
        console.log('id', id)

        // Disable current card and enable new card
        $('.card.active').removeClass('active');
        $('.card.' + type).addClass('active');

        // based on the activity type, update titles in html
        $('.card.' + type + ' h1').text(type + ' #'+id); //update the title of each page

        // TODO: make the following if dynamic
        // if video tab is active get the video url and display in video.html
        //display the video url in a new tab instead of the card
        if(type == 'video'){
            $('.card.active').removeClass('active');
            var video_url = activityButton.attr('data-video-url');
            window.open(video_url, '_blank'); //open paint splash game in a new window
        }
//        if($('.card.video').hasClass('active')){
//
//            var video_url = activityButton.attr('data-video-url');
//            console.log(video_url);
//            //$('#videoFrame').attr('src', video_url); //display in video.html
//            window.open(video_url, '_blank');
//
//            //update h1
//
//        }
         if($('.card.table').hasClass('active')){

             $('input[name="table-id"]').attr('value', id)
        }

        // if gallery div is active, load the gallery
        if($('.card.gallery').hasClass('active')){

            console.log(activityButton.attr('data-heading'));
            if(activityButton.attr('data-heading')){
                $('.card.' + type + ' h1').text(type + ' #'+id + ' '+ activityButton.attr('data-heading'));
            }



            // pass id to gallery activity - to upload image form in gallery.html
            $('#upload-img input[name="act-id"]').attr('value', id)

            var view = activityButton.attr('data-view');
            console.log('view: ', view)

            var number_of_group = activityButton.attr('data-group');
//            if(view == 'group'){
//                number_of_group = activityButton.attr('data-group-number');
//               // console.log('number of group:' , number_of_group)
//            }

            //call function from gallery.js
            $("input[name='group-id']").attr('value', number_of_group);
            viewDiv(view, number_of_group);
        }


        if($('.card.multQues').hasClass('active')){

//            //hide questions previously added in the DOM
//            $('.act2ques').hide()
//
//            //get which question is clicked and activate that div for question
//            var quesno = activityButton.attr('data-quesid');
//            $('div[data-quesno="'+quesno+'"]').show()
            //get which question clicked.
            console.log('#'+id)
            //hide its siblings
            $('#'+id).siblings().hide();
            //show the div
            $('#'+id).show();

//
//            //TODO: call loadHTML() from here

        }

        if($('.card.brainstorm').hasClass('active')){

            $('.card.' + type + ' h1').text('Vocabulary'); //update the title of each page
            $('input[name="brainstorm-id"]').attr('value', id)


            loadIdeaToWorkspace();
        }

        //user logging
        enterLogIntoDatabase('click', type , 'id'+id, current_pagenumber)




    });
};

var loadActivityIndex = function(){
    //TODO: call the parser here using ajax request, parse the files and build activity index

}

