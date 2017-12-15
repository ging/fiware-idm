
// Handle the authorization of users to be administrators
$(document).ready(function() {

	// Filter admninistrators
    $("#members").find('.form-control').bind("keyup input",function(e) {
    	input = $(this);
	    filter = $(this).val().toUpperCase();
	    ul = $("#members").find(".datatable-content");
	    li = ul.children("div");

	    for (i = 0; i < li.length; i++) {
	        span = li[i].querySelectorAll("div.name")[0];
	        if (span.innerHTML.toUpperCase().indexOf(filter) > -1) {
	            li[i].style.display = "";
	        } else {
	            li[i].style.display = "none";
	        }
	    }

  		if(ul.children('div:visible').length == 0) {
  			if (ul.find("#alert_no_users").length < 1){
  				ul.append('<p class="alert alert-info empty" id="alert_no_users" style="display: block;">No users found.</p>');
  			} 
  		} else {
  			ul.find("#alert_no_users").remove();
  		}    
    	
    });

    var timer;
    var input_change_authorize = null
    // Send requests to server to obtain usernames and show in available members column
    $("#authorize_user").find('#available_update_owners_users').bind("keyup input",function(e) {

    	if($(this).val().indexOf('%') > -1 || $(this).val().indexOf('_') > -1) {

    		$("#authorize_user").find("#alert_error_search_available").show("open")
    		$("#authorize_user").find(".available_members").empty()
    		$("#authorize_user").find("#spinner_update_owners_users").hide('close')

    		input_change_authorize = $(this).val();

	    } else {
      
	    	$("#alert_error_search_available").hide("close")
	    	clearTimeout(timer);
	    	$("#authorize_user").find("#spinner_update_owners_users").show('open')
        	var input = $(this).val();
        	timer = setTimeout(function(){
        		input_change_authorize = available_users(input, input_change_authorize, 'table_row_available_user_template')
        	}, 300);
	    }    
    });

    // Exit from form to authorize users to the application
    $("#authorize_user").find('.cancel, .close').click(function () {
      exit_authorize_users()
    });

    // Filter authorized members
    $("#authorize_user").find('#update_owners_users_members').bind("keyup input",function(e) {
      input = $(this);
      filter = $(this).val().toUpperCase();
      ul = $("#authorize_user").find(".members");
      li = ul.children();

      for (i = 0; i < li.length; i++) {
          span = li[i].querySelectorAll("span.name")[0];
          if (span.innerHTML.toUpperCase().indexOf(filter) > -1) {
              li[i].style.display = "";
          } else {
              li[i].style.display = "none";
          }
      }
  
      $("#alert_error_search_authorized").hide("close") 
      
    });


    // Change available member to members column
    $("#available_members").on("click",".active", function(event) { 

      // Stop linking        
        event.preventDefault();

        // item of list
        row = $(this).parent()

        // Id and name of user
        var user_id = row.parent().attr("id")
        var username = row.find(".name").html()
        var image = row.parent().find(".avatar").children('img').first().attr('src')

        if ($("#authorize_user").find('ul.update_owners_users_members').find('#'+user_id).length) {
            info_added_user = "<span id='info_added_user' style='display: none; text-align: center;' class='help-block alert alert-warning'>User "+user_id+" has been already added</span>"
            $("#authorize_user").find("#info_added_user").replaceWith(info_added_user);
            $("#authorize_user").find("#info_added_user").fadeIn(800).delay(300).fadeOut(800);
        } else {
            var assign_role_user_row = $('#table_row_set_admin_row_template').html();
            assign_role_user_row = assign_role_user_row.replace(/username/g, String(username));
            assign_role_user_row = assign_role_user_row.replace(/user_id/g, String(user_id));
            assign_role_user_row = assign_role_user_row.replace(/user_avatar/g, String(image));
            $("#authorize_user").find(".members").append(assign_role_user_row);

            info_added_user = "<span id='info_added_user' style='display: none; text-align: center;' class='help-block alert alert-success'>User "+user_id+" added</span>"
            $("#authorize_user").find("#info_added_user").replaceWith(info_added_user);
            $("#authorize_user").find("#info_added_user").fadeIn(800).delay(300).fadeOut(800);

        }
    });

    // Remove authorized member
    $(".members").on("click",".remove", function(event) { 

      // Stop linking    
      event.preventDefault();

      // item of list
      row = $(this).parent()

      // Id and name of user
      var user_id = row.parent().attr("id")
      var username = row.find(".name").html()  

      var info_added_user = "<span id='info_added_user' style='display: none; text-align: center;' class='help-block alert alert-success'>User "+user_id+" removed from application</span>"
      $("#authorize_user").find("#info_added_user").replaceWith(info_added_user);
      $("#authorize_user").find("#info_added_user").fadeIn(800).delay(300).fadeOut(800);
      row.parent().fadeOut(500, function(){ row.parent().remove(); });

    });

    // Handle the submit button form to submit assignment
  $("#submit_authorized_administrators_form").bind("keypress submit", function(event) {

    // stop form from submitting by pressing enter
    if (event.which == 13) {
        event.preventDefault();
    } else if (event.type == "submit") {

      // stop form from submitting normally
      event.preventDefault();
      var user_ids = []
      $("#authorize_user").find('ul.update_owners_users_members').children().each(function() {
        user_ids.push(this.id)
      })

      $('#submit_authorize').val(JSON.stringify(user_ids))

      $('#submit_authorized_administrators_form')[0].submit();
    }
  });

});


// Function to exit from dialog
function exit_authorize_users() {
  $("#authorize_user").find("#alert_error_search_available").hide("close");
  $("#authorize_user").find(".alert-warning").hide("close");
  $("#authorize_user").find(".modal-footer").find("#submit_button").val("Save");
  $("#authorize_user").find('#no_available_update_owners_users').hide('close');
  $("#authorize_user").find('#perform_filter_available_update_owners_users').show('open');
  $("#authorize_user").find('#available_update_owners_users').val('');
  $("#authorize_user").find(".available_members").empty();
  $("#authorize_user").find(".alert-warning").hide("close");
  $("#authorize_user").find('#update_owners_users_members').val('');
}