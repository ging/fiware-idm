
// Handle authorize users to the application

$(document).ready(function(){

	// Pop up with a form to authorize new users to the application
	$('#auth_users_action_manage_application_users').click(function () {
		$('#backdrop').show();
        $('#authorize_user').show('open');
        for (var i = 0; i < users_authorized.length; i++) {
        	var assign_role_user_row = $('#table_row_assign_role_user_template').html();
	        assign_role_user_row = assign_role_user_row.replace(/username/g, String(users_authorized[i].username));
	        assign_role_user_row = assign_role_user_row.replace(/user_id/g, String(users_authorized[i].user_id));
	        $("#authorize_user").find(".members").append(assign_role_user_row);
        }
	});

	// Exit from form to authorize users to the application
    $("#authorize_user").find('.cancel, .close').click(function () {
    	input_change_authorize = null
        $('#backdrop').hide();
        $("#alert_error_search").hide("close")
        $("#authorize_user").find('#no_available_update_owners_users').hide('close');
        $("#authorize_user").find('#perform_filter_available_update_owners_users').show('open');
        $('#authorize_user').hide('close');
        $("#authorize_user").find('#available_update_owners_users').val('');
        $("#authorize_user").find(".available_members").empty()
        $("#authorize_user").find(".members").empty()
    });

    var timer;
    var input_change_authorize = null
    // Send requests to server to obtain usernames
    $("#authorize_user").find('.update_owners_users_server_filter').bind("keyup input",function(e) {

    	if($(this).val().indexOf('%') > -1 || $(this).val().indexOf('_') > -1) {

    		$("#authorize_user").find("#alert_error_search").show("open")
    		$("#authorize_user").find(".available_members").empty()
    		$("#authorize_user").find("#spinner_update_owners_users").hide('close')

    		input_change_authorize = $(this).val();

	    } else {
      
	    	$("#alert_error_search").hide("close")
	    	clearTimeout(timer);
	    	$("#authorize_user").find("#spinner_update_owners_users").show('open')
        	var input = $(this).val();
        	timer = setTimeout(function(){
        		input_change_authorize = authorize_users(input, input_change_authorize)
        	}, 300);
	    }    
    });

    // Change available member to members column
    $("#available_members").on("click",".active", function(event) { 

    	// Stop linking        
        event.preventDefault();

        // item of list
        row = $(this).parent()

        // Id and name of user
        var id = row.parent().attr("id")
        var username = row.find(".name").html()

        if (users_authorized.some(member => member.user_id === id)) {
        	info_added_user = "<span id='info_added_user' style='display: none; text-align: center;' class='help-block alert alert-warning'>User "+id+" has been already added</span>"
        	$("#authorize_user").find("#info_added_user").replaceWith(info_added_user);
        	$("#authorize_user").find("#info_added_user").fadeIn(800).delay(300).fadeOut(800);
	    } else {
	    	var assign_role_user_row = $('#table_row_assign_role_user_template').html();
	        assign_role_user_row = assign_role_user_row.replace(/username/g, String(username));
	        assign_role_user_row = assign_role_user_row.replace(/user_id/g, String(id));
	        $("#authorize_user").find(".members").append(assign_role_user_row);
	        info_added_user = "<span id='info_added_user' style='display: none; text-align: center;' class='help-block alert alert-success'>User "+id+" added</span>"
        	$("#authorize_user").find("#info_added_user").replaceWith(info_added_user);
        	$("#authorize_user").find("#info_added_user").fadeIn(800).delay(300).fadeOut(800);
	        users_authorized.push({user_id: id, username: username});
	    }
    });

    // Remove authorized member
    $(".members").on("click",".active", function(event) { 

    	// Stop linking        
        event.preventDefault();

        // item of list
        row = $(this).parent()

        // Id and name of user
        var id = row.parent().attr("id")
        var username = row.find(".name").html()  
        var index = users_authorized.findIndex(member => member.user_id === id);;  
        if (index > -1) {
            users_authorized.splice(index, 1);
            info_added_user = "<span id='info_added_user' style='display: none; text-align: center;' class='help-block alert alert-success'>User "+id+" removed from application</span>"
        	$("#authorize_user").find("#info_added_user").replaceWith(info_added_user);
        	$("#authorize_user").find("#info_added_user").fadeIn(800).delay(300).fadeOut(800);
        	row.parent().fadeOut(500, function(){ row.parent().remove(); });
        }
    });

    // Handle the submit button from the create role form
	$("#submit_authorized_users_form").bind("keypress submit", function(event) {

		// stop form from submitting normally
		if (event.which == 13) {
	    	event.preventDefault();
		} else if (event.type == "submit") {

			// stop form from submitting normally
			event.preventDefault();

			// get the action attribute from the <form action=""> element 
	        var $form = $(this),
	            url = $form.attr('action');

	        // Send the data using post with element id name and name2
	        var posting = $.post(url, { submit_authorize: users_authorized });

	        // Alerts the results 
	        posting.done(function(result) {
	        	if (result.type == "success") {
	        		input_change_authorize = null
			        $('#backdrop').hide();
			        $("#alert_error_search").hide("close")
			        $("#authorize_user").find('#no_available_update_owners_users').hide('close');
			        $("#authorize_user").find('#perform_filter_available_update_owners_users').show('open');
			        $('#authorize_user').hide('close');
			        $("#authorize_user").find('#available_update_owners_users').val('');
			        $("#authorize_user").find(".available_members").empty()
			        $("#authorize_user").find(".members").empty()	
	        	} else {

	        	}

        		var message = $('#message_template').html();
                message = message.replace(/type/g, result.type);
                message = message.replace(/data/g, result.text);
                $(".messages").replaceWith(message);

	        });
		}
  	});

  	// To remove message
    $("#container.container-fluid").on("click","#close_message",function () {
    	alert("ja")
        $(".messages").empty();
    });

});



// Function to search available members
function authorize_users(input, input_change_authorize) {

	if (input.length > 1 && input_change_authorize !== input) {

		$("#authorize_user").find('#perform_filter_available_update_owners_users').hide('close');

		var url = "/idm/applications/"+ application.id +"/available/users"
    	var key = { username: input }

    	$.post(url, key, function(data) {
			if(data.constructor === Array){
				$("#authorize_user").find(".available_members").empty()
				for(available_user in data) {
					var authorize_user_row = $('#table_row_authorize_user_template').html();
		            authorize_user_row = authorize_user_row.replace(/username/g, String(data[available_user].username));
		            authorize_user_row = authorize_user_row.replace(/user_id/g, String(data[available_user].id));
		            $("#authorize_user").find(".available_members").append(authorize_user_row);
		            $("#authorize_user").find("#spinner_update_owners_users").hide('close')
		            $("#authorize_user").find('#no_available_update_owners_users').hide('close');
				}
			} else {
				$("#authorize_user").find("#spinner_update_owners_users").hide('close')
				$("#authorize_user").find(".available_members").empty()
				$("#authorize_user").find('#no_available_update_owners_users').show('open');
			}
		});
	} else if (input_change_authorize !== input && input.length < 1){
		$("#authorize_user").find(".available_members").empty()
		$("#authorize_user").find('#no_available_update_owners_users').hide('close');
        $("#authorize_user").find('#perform_filter_available_update_owners_users').show('open');
        $("#authorize_user").find("#spinner_update_owners_users").hide('close')
	} else {
		$("#authorize_user").find("#spinner_update_owners_users").hide('close')
	}

	input_change_authorize = input;
	return input_change_authorize
}