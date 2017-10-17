
// Handle authorize users to the application

$(document).ready(function(){
	var input_change_authorize = null

	// Pop up with a form to authorize new users to the application
	$('#auth_users_action_manage_application_users').click(function () {
		$('#backdrop').show('open');
        $('#authorize_user').show('open');
	});

	// Exit from form to authorize users to the application
    $("#authorize_user").find('.cancel, .close').click(function () {
    	input_change_authorize = null
        $('#backdrop').hide('close');
        $("#alert_error_search").hide("close")
        $("#authorize_user").find('#no_available_update_owners_users').hide('close');
        $("#authorize_user").find('#perform_filter_available_update_owners_users').show('open');
        $('#authorize_user').hide('close');
        $("#authorize_user").find('#available_update_owners_users').val('');
        $("#authorize_user").find(".available_members").empty()
    });

    // Send requests to server to obtain usernames
    $("#authorize_user").find('#available_update_owners_users').keyup(function(e) {

    	if($(this).val().indexOf('%') > -1 || $(this).val().indexOf('_') > -1) {

    		$("#authorize_user").find("#alert_error_search").show("open")
    		$("#authorize_user").find(".available_members").empty()

	    } else {

	    	$("#alert_error_search").hide("close")

	    	if ($(this).val().length > 1 && input_change_authorize !== $(this).val()) {

	    		$("#authorize_user").find("#spinner_update_owners_users").show('open')

	    		$("#authorize_user").find('#perform_filter_available_update_owners_users').hide('close');

	    		var url = "/idm/applications/"+ application.id +"/authorize/users"
		    	var key = { username: $(this).val() }

		    	$.post(url, key, function(data) {
					if(data.constructor === Array){
						$("#authorize_user").find(".available_members").empty()
						for(user in data) {
							var authorize_user_row = $('#table_row_authorize_user_template').html();
				            authorize_user_row = authorize_user_row.replace(/username/g, String(data[user].username));
				            authorize_user_row = authorize_user_row.replace(/user_id/g, String(data[user].id));
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
	    	} else if (input_change_authorize === $(this).val()){
	    	} else if ($(this).val().length == 1){
	    	} else {
	    		$("#authorize_user").find(".available_members").empty()
	    		$("#authorize_user").find('#no_available_update_owners_users').hide('close');
	            $("#authorize_user").find('#perform_filter_available_update_owners_users').show('open');
	    	}
	    	
	    }
	    input_change_authorize = $(this).val()
    });

    $("#available_members").on("click",".member", function(event) { 

    	// Stop linking        
        event.preventDefault();

        // Id and name of user
        var id = $(this).parent().attr("id")
        var username = $(this).find(".name").html()

    	var assign_role_user_row = $('#table_row_assign_role_user_template').html();
        assign_role_user_row = assign_role_user_row.replace(/username/g, String(username));
        assign_role_user_row = assign_role_user_row.replace(/user_id/g, String(id));
        $("#authorize_user").find(".members").append(assign_role_user_row);
        $("#authorize_user").find(".available_members").find("#"+id).remove()
    });

});