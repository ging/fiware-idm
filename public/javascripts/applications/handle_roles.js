
// Handle button clicks and asynchronous request to the server in order to create roles

$(document).ready(function(){

    // Show permissions of a role
    $("#update_owners_roles").on("click",".btn", function(){
        var role = $(this).attr('id');
        var permission = null;
        for (var i = 0; i < application.permissions.length; i++) {
            permission = application.permissions[i].id
            if (['provider', 'purchaser'].includes(role)) {
                if(!['1', '2', '3' ,'4' ,'5' ,'6'].includes(permission)) {                    
                    $("[data-permission-id="+permission+"]").hide()
                } else {
                    $("[data-permission-id="+permission+"]").show()
                    if(application.role_permission_assign[role].includes(permission)) {
                        $("[data-permission-id="+permission+"]").addClass("active")    
                    } else {
                        $("[data-permission-id="+permission+"]").removeClass("active")
                    }
                }
            } else {
                $("[data-permission-id="+permission+"]").show()
                if (typeof application.role_permission_assign[role] === 'undefined') {
                    $("[data-permission-id="+permission+"]").removeClass("active")
                } else {
                    if(application.role_permission_assign[role].includes(permission)) {
                        $("[data-permission-id="+permission+"]").addClass("active")    
                    } else {
                        $("[data-permission-id="+permission+"]").removeClass("active")
                    }
                }
            }
        }
        if (['provider', 'purchaser'].includes(role)) {
            $('#list_permissions').addClass('disabled-list')
        } else {
            $('#list_permissions').removeClass('disabled-list')
        }
        $("#update_owners_permissions").show();
        $("#update_owners_info_message").hide();
    });

    // Pop up with a form to create a new role
    $('#roleButton').click(function () {
      	$('#backdrop').show();
        $('#create_role').show('open');
        return false;
	});

    // Exit from form to create new role
	$('#esc_role_creation').click(function () {
        $("#create_role_form").find("#id_name").val('');
    	$('#backdrop').hide();
        $('#create_role').hide('close');
        $("#create_role_form").find(".help-block.alert.alert-danger").hide('close');
        return false;
	});

	// Handle the submit button from the create role form
	$("#create_role_form").submit(function(event) {

        // stop form from submitting normally
        event.preventDefault();

        // get the action attribute from the <form action=""> element 
        var $form = $(this),
            url = $form.attr('action');

        // Send the data using post with element id name 
        var posting = $.post(url, { name: $("#create_role_form").find('#id_name').val()});

        // Alerts the results 
        posting.done(function(result) {
            
        	// See if the result of post is an error
    		if (result.type ==='warning') {
                // Show error input empty
                $('#create_role_form').find('.help-block.alert.alert-danger').show('open');
            
        	} else if (result.type ==='danger') {
                // Empty input from role creation form
                $('#create_role_form').find('#id_name').val('');

                // Hide error if exist
                $('#create_role_form').find('.help-block.alert.alert-danger').hide('close');

                // Return to normal view
                $('#backdrop').hide();
                $('#create_role').hide('close');

                // Add message
                var message = $('#message_template').html();
                message = message.replace(/type/g, result.type);
                message = message.replace(/data/g, result.text);
                $('.messages').replaceWith(message);

            // If is not an error, add the role to the list 
            } else {
                
        		// Create new row in role column
        		var role_row = $('#table_row_role_template').html();
                role_row = role_row.replace(/role_name/g, result.role.name);
                role_row = role_row.replace(/role_id/g, String(result.role.id));
                role_row = role_row.replace(/app_id/g, String(application.id));
                $('#update_owners_roles').append(role_row);

                // Add to roles array
                application.roles.push(result.role);

                // Empty input from role creation form
                $('#create_role_form').find('#id_name').val('');

                // Hide error if exist
                $('#create_role_form').find('.help-block.alert.alert-danger').hide('close');

                // Return to normal view
                $('#backdrop').hide();
              	$('#create_role').hide('close');

                // Add message
                var message = $('#message_template').html();
                message = message.replace(/type/g, result.message.type);
                message = message.replace(/data/g, result.message.text);
                $('.messages').replaceWith(message);
        	}	   
        });

    });

    // To show a little form to edit a role
    $("#update_owners_roles").on("click",".ajax-inline-edit", function(event) { 
        
        // Stop linking        
        event.preventDefault();

        // Load template
        var edit_role = $('#edit_role').html();

        // Edit template with role and applications ids and role name
        var role_name = $(this).parent().find("label").html();
        var role_id = String($(this).attr("href").split("/")[6])
        var app_id = String(application.id)

        edit_role = edit_role.replace(/app_id/g, app_id);
        edit_role = edit_role.replace(/role_id/g, role_id);
        edit_role = edit_role.replace(/role_name/g, role_name);

        // Replace the row with the template edit_role edited
        $("#update_owners_roles").find("#"+role_id).replaceWith(edit_role);
    });

    // Handle the submit button from the edit role 
    $("#update_owners_roles").on("click",".inline-edit-submit", function(event) { 
        
        // Stop linking        
        event.preventDefault();

        // Body parameters of request
        var role_id = String($(this).attr("href").split("/")[6])
        var role_name = $("#update_owners_roles").find("#"+role_id+".form-control").val()

        // Send put request
        $.ajax({
            url: $(this).attr('href'),
            type: 'PUT',
            data: { role_name: role_name, role_id: role_id },
            success: function(result) {

                if (result.type === 'warning') {
                    // Show error input empty
                    $("#assign_role_permission_form").find("#alert_error").show('open');
                } else if (result.type === 'danger') {
                    // Hide error if exists
                    $("#assign_role_permission_form").find("#alert_error").hide('close');

                    // Add message
                    var message = $('#message_template').html();
                    message = message.replace(/type/g, result.type);
                    message = message.replace(/data/g, result.text);
                    $(".messages").replaceWith(message);

                } else {
                    // Update role name
                    var role_row = $('#table_row_role_template').html();
                    role_row = role_row.replace(/role_name/g, role_name);
                    role_row = role_row.replace(/role_id/g, role_id);
                    role_row = role_row.replace(/app_id/g, String(application.id));
                    $("#update_owners_roles").find("#"+role_id).replaceWith(role_row);

                    //Hide error if exists
                    $("#assign_role_permission_form").find("#alert_error").hide('close');

                    // Add message
                    var message = $('#message_template').html();
                    message = message.replace(/type/g, result.type);
                    message = message.replace(/data/g, result.text);
                    $(".messages").replaceWith(message);
                } 
            }
        });

    });

    // Handle the cancel button from edit role
    $("#update_owners_roles").on("click",".inline-edit-cancel", function(event) { 
        
        // Stop linking        
        event.preventDefault();

        var role_id = $(this).attr("href").split("/")[6]

        // Function to find the name of the role
        function find_role_name(role, index, array) {
            if (role.id === role_id) {
                return role
            }
        }

        var role = application.roles.find(find_role_name)

        // To return to the previous step
        var role_row = $('#table_row_role_template').html();
        role_row = role_row.replace(/role_name/g, role.name);
        role_row = role_row.replace(/role_id/g, String(role.id));
        role_row = role_row.replace(/app_id/g, String(application.id));

        $("#assign_role_permission_form").find("#alert_error").hide('close');
        $("#update_owners_roles").find("#"+role_id).replaceWith(role_row);
        
    });

    // Form to delete a role
    $("#update_owners_roles").on("click",".delete", function(event) { 

        // Stop linking        
        event.preventDefault();

        // Change form action
        var role_id = String($(this).parent().attr("id"));
        var app_id = String(application.id);
        var action = "/idm/applications/"+app_id+"/edit/roles/"+role_id+"/delete";
        $("#delete_role_form").attr("action", action);

        // Show form
        $('#backdrop').show();
        $('#delete_role').show('open');
    });

    // To confirm delete the role
    $("#delete_role_form").submit(function(event) {

        // stop form from submitting normally
        event.preventDefault();

        // get the action attribute from the <form action=""> element 
        var form = $("#delete_role_form"),
            url = form.attr('action');

        var role_id = url.split("/")[6]
        var app_id = url.split("/")[3]

        // Send delete request
        $.ajax({
            url: url,
            type: 'DELETE',
            data: { role_id: role_id, app_id: app_id },
            success: function(result) {
                if (result.type === "success") {
                    $("#update_owners_roles").find("#"+role_id).remove();
                    delete application.role_permission_assign[role_id]
                    $("#update_owners_permissions").hide('close');
                    $("#update_owners_info_message").show('open');
                } 
                var message = $('#message_template').html();
                message = message.replace(/type/g, result.type);
                message = message.replace(/data/g, result.text);
                $(".messages").replaceWith(message);

                $('#backdrop').hide();
                $('#delete_role').hide('close');
            }
        });
    });

    // Exit from form to delete role
    $("#delete_role").find('.cancel, .close').click(function () {
        $('#backdrop').hide();
        $('#delete_role').hide('close');
    });

    // To remove message
    $("#container.container-fluid").on("click","#close_message",function () {
        $(".messages").empty();
    });
});