var host_url = window.location.host
var ka_imgID
$(function(){


    //hide black image src in the beginning
    $('img#ka-image').hide();

    ka_submit_button();


    //ka_submit_button();
    copy_ka_text_button();

    //handle KA image upload
    //var ka_imgID
    //NOTE: if use the same file -- it will not trigger this event second time, have to have different file name.
     $('#ka_img_upload').on('change',function(event){
         console.log('trying to upload khan academy photos')
         form_data = new FormData($('#ka-upload-img-form')[0]);
         console.log('form_data', form_data);
         readURL_ka(this);
         //console.log('herebehre', $('input[name="ka-act-id"]').val())

////      //TODO: save the image in database
          $.ajax({
                  type:'POST',
                  url:'http://'+ host_url +'/uploadKAImage/',
                  processData: false,
                  contentType: false,
                  async: false,
                  cache: false,
                  data : form_data,
                  success: function(response){

                    //this ID is later used to update KA table in DB with the question/answer
                    ka_imgID = response.ka_imgID
                    console.log('uploaded image id :: ', response.ka_img);
                    //clear any previous responses if any
                    $("#KAAnswer").val('');
                    //clear radio button
                    $('input:radio[name="ka-response-type"]').each(function(i) {
                            this.checked = false;
                    });

                    enterLogIntoDatabase('khan academy-'+activity_id, 'upload' , 'imgID-'+ka_imgID, current_pagenumber)


                }

              });
     });

//    //handle textarea on focus out
//    $('#KAAnswer').blur(function() {
//
//            //TODO: add user log event; user log event will capture multiple attempts but model will store the latest answer
//
//            var isRadioBtnChecked = $("input[name='ka-response-type']").prop('checked');
//            //will return false if none of the radio button is not checked
//            //will return true if one of the radio button is checked
//
//            var user_response = $('#KAAnswer').val();
//            //console.log('user response::',user_response)
//
//            var ka_radio_input_type = $("input[name='ka-response-type']:checked").val();
//            //console.log('ka-response-type', ka_radio_input_type);
//
//            showPrompt(user_response);
//
//            saveKAresponseToDB(activity_id, ka_imgID, ka_radio_input_type, user_response);
//
//            $('.ka-answer-p').text(user_response)
//
//            //show the copy button since answer is posted
//            $('#ka-showAnsweredQues').show();
//
//        });


    $('.moreinfobtn').click(function(e){
         $("#moreInfoModal").css({ display: "block" });


        $(".modal-close").click(function(e){
             $("#moreInfoModal").css({ display: "none" });
        });
    })



})


//handle file upload and displays in the screen
var readURL_ka = function(input) {

        $('img#ka-image').show();

        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#ka-image')
                    .attr('src', e.target.result)
                    .width(570)
                    .height(300)
                    .css("padding", "30px");
            };

            reader.readAsDataURL(input.files[0]);
        }
    }

//handle user answer submit
var ka_submit_button = function(){
    $('#ka-submit').click(function(e){
        e.preventDefault();

       if(typeof ka_imgID === "undefined") {

            showKAConfirmMsg("Upload your screenshot first");
            return false; //dont submit anything
       }

        //TODO: add user log event; user log event will capture multiple attempts but model will store the latest answer


        var user_response = $('#KAAnswer').val();
        //console.log('user response::',user_response)

        var ka_radio_input_type = $("input[name='ka-response-type']:checked").val();

        //console.log('ka-response-type', ka_radio_input_type);

        if(user_response.length!=0){
            showPrompt(user_response, "ka");
        }

        enterLogIntoDatabase('khan academy before inserting into db img id ' + ka_imgID, 'answer'+activity_id , user_response, current_pagenumber)
        if($("input[name='ka-response-type']").is(':checked') && user_response.length!=0) {
            console.log('submitting/resubmitting again')
            saveKAresponseToDB(activity_id, ka_imgID, ka_radio_input_type, user_response);
            enterLogIntoDatabase('khan academy after inserting into db img id '+ ka_imgID, 'answer'+activity_id , user_response, current_pagenumber)
        }
        else{
            showKAConfirmMsg("please enter all the values");
        }


        $('.ka-answer-p').text(user_response)

        //show the copy button since answer is posted
        $('#ka-showAnsweredQues').show();
   })
}

//method to copy student answer using a button
var copy_ka_text_button = function(){
    $('#ka-row-copy-button').click(function(){
        //https://jqueryhouse.com/copy-data-to-clipboard-using-jquery/
        var copied_text = $(this).parent().siblings().text();
        if(!copied_text.trim()) {

            showKAConfirmMsg("enter answer in the textbox, then hit the copy button");
        }else{
            console.log(copied_text);

            var value = '<input value="'+ copied_text +'" id="selVal" />';
            $(value).insertAfter($(this));
            $("#selVal").select(); //select works for input //https://stackoverflow.com/questions/50941892/copy-to-clipboard-value-of-selected-option
            document.execCommand("copy");
            $('div#ka-showAnsweredQues').find("#selVal").remove();

            //alert("Copied the text: " + copied_text);
            showKAConfirmMsg(copied_text)
            enterLogIntoDatabase('attempted to use copy button', 'khan academy' , copied_text, current_pagenumber)
        }


    })
}

var persistence_check = function(data){
    //check if any entry exist for logged in user and with the ka-id
    //if none returned do nothing
    //if returned image id then populate the fields
    //from server it gives us a string, we need to parse it
    //console.log(jQuery.type(data))
    var ka_obj = jQuery.parseJSON(data);
    if(ka_obj.length!=0){
        //console.log(ka_obj)

        //access the latest item if multiple items are returned
        index = ka_obj.length-1;


        ka_imgID = ka_obj[index].pk
        console.log(ka_obj[index].fields) //prints the item
        //image url
        var img_url = ka_obj[index].fields['ka_image']
        console.log(img_url)

        //radio button value
        var response_type = ka_obj[index].fields['response_type']

        //ka-response
        var ka_response = ka_obj[index].fields['response']

        //populate the items
        $('#ka-image').attr('src', 'http://'+ host_url +'/media/'+ img_url).width(570)
                    .height(300)
                    .css("padding", "30px")
                    .css('display', 'block');

        //radio button
        if(response_type){
            $('input[name=ka-response-type][value='+response_type+']').attr('checked', true);
        }


        //textarea
        $("#KAAnswer").val(ka_response);

    }else{
        //empty the user responses
        $('img#ka-image').hide();
        $("#KAAnswer").val('');
        //clear radio button
        $('input:radio[name="ka-response-type"]').each(function(i) {
                this.checked = false;
        });

    }



}

var saveKAresponseToDB = function(activity_id, imgID, response_type, answer_text){
        console.log('image ID ID ID IDID', imgID)
        $.post({

               async: false,
               url:'/submitKAAnswer',
               data: {
                    'activity_id': activity_id,
                    'imgID': imgID,
                    'response_type': response_type,
                    'answer': answer_text,
                    },
               success: function(response){
                    showKAConfirmMsg("Your response was saved");
                    console.log(response)
                    enterLogIntoDatabase('khan academy after inserting into db, img id'+imgID, 'answer'+activity_id , answer_text, current_pagenumber)
            }

            });


}

var showKAConfirmMsg = function(msg){

     modal = $("#ka-confirm-modal")

     $("#ka-confirm-modal").css({ display: "block" });
     $("#ka-confirm-modal h2").text(msg);

     $(".modal-close").click(function(e){
         $("#ka-confirm-modal").css({ display: "none" });
     });

}


