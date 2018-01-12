
// Function to search all available members
function available_users(input, input_change_authorize, template) {

	if (input.length > 1 && input_change_authorize !== input) {

		$("#authorize_user").find('#perform_filter_available_update_owners_users').hide('close');
		
		var url = "/idm/users/available"
    	var key = { username: input }
    	
    	$.ajax({
            url: url,
            type: 'POST',
            beforeSend: beforeSend($('input:hidden[name=_csrf]').val()),
            data: key,
            success: function(data) {
            	if(data.constructor === Array){
					$("#authorize_user").find(".available_members").empty()
					for(available_user in data) {
						var authorize_user_row = $('#'+template).html();
			            authorize_user_row = authorize_user_row.replace(/username/g, htmlEntities(data[available_user].username));
			            authorize_user_row = authorize_user_row.replace(/user_id/g, String(data[available_user].id));
			            authorize_user_row = authorize_user_row.replace(/user_avatar/g, String(data[available_user].image));
			            $("#authorize_user").find(".available_members").append(authorize_user_row);
			            $("#authorize_user").find("#spinner_update_owners_users").hide('close')
			            $("#authorize_user").find('#no_available_update_owners_users').hide('close');
					}
				} else if (data === 'error') {
	    			exit_authorize_users()
	    			$("#authorize_user").modal('toggle')
				} else {
					$("#authorize_user").find("#spinner_update_owners_users").hide('close')
					$("#authorize_user").find(".available_members").empty()
					$("#authorize_user").find('#no_available_update_owners_users').show('open');
				}
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

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}