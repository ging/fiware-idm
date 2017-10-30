
// Handle button clicks and asynchronous request to the server in order to create permissions

$(document).ready(function(){

    // Select permission item from list
    $("#update_owners_permissions").on("click",".list-group-item", function(){
         
        var role = $("#update_owners_roles").find('div.active').attr('id');

        if (!['provider', 'purchaser'].includes(role)) {

            var permission = $(this).attr('data-permission-id');
            if (typeof application.role_permission_assign[role] === 'undefined') {
                application.role_permission_assign[role] = []
            }

            if ($("[data-permission-id="+permission+"]").hasClass("active")) {
                index = application.role_permission_assign[role].indexOf(permission);
                if (index > -1) {
                    application.role_permission_assign[role].splice(index, 1);
                }
            } else {
                application.role_permission_assign[role].push(permission);
            }
            $("[data-permission-id="+permission+"]").toggleClass("active")
        }
    });


	// Pop up with a form to create a new permission
	$('#permButton').click(function () {
		$('#backdrop').show();
        $('#create_permission').show('open');
        return false;
	});

	// Exit from form to create new permission
	$('#esc_perm_creation').click(function () {
        $("#create_permission_form").find("#id_name").val('');
        $("#create_permission_form").find('#id_description').val(''); 
        $("#create_permission_form").find('#id_action').val(''); 
        $("#create_permission_form").find('#id_resource').val(''); 
        $("#create_permission_form").find('#id_xml').val('');
        $("#create_permission_form").find(".help-block.alert.alert-danger").hide('close');
		$('#backdrop').hide();
        $('#create_permission').hide('close');
        return false;
	});

	// Handle the submit button from the create  permission
	$("#create_permission_form").submit(function(event) {

        // stop form from submitting normally
        event.preventDefault();

        // get the action attribute from the <form action=""> element 
        var $form = $(this),
            url = $form.attr('action');

        // Send the data using post with element id name and name2
        var posting = $.post(url, { name: $("#create_permission_form").find('#id_name').val(), 
                                    description: $('#id_description').val(), 
                                    action: $('#id_action').val(), 
                                    resource: $('#id_resource').val(), 
                                    xml: $('#id_xml').val() });

        // Alerts the results 
        posting.done(function(result) {

        	// See if the result of post data is an error
            if (result.type === 'warning') {
                $("#create_permission_form").find(".help-block.alert.alert-danger").hide('close');
                for (var i = result.text.length - 1; i >= 0; i--) {
                    $("#create_permission_form").find("#"+result.text[i].message+".help-block.alert.alert-danger").show('open');
                }
                return false;
            } else if (result.type === 'danger') {
                // Empty input from role creation form
                $("#create_permission_form").find("#id_name").val('');
                $("#create_permission_form").find('#id_description').val(''); 
                $("#create_permission_form").find('#id_action').val(''); 
                $("#create_permission_form").find('#id_resource').val(''); 
                $("#create_permission_form").find('#id_xml').val('');

                // Hide error if exist
                $("#create_permission_form").find(".help-block.alert.alert-danger").hide('close');

                // Return to normal view
                $('#backdrop').hide();
                $('#create_permission').hide('close');

                // Add message
                var message = $('#message_template').html();
                message = message.replace(/type/g, result.type);
                message = message.replace(/data/g, result.text);
                $(".messages").replaceWith(message);

            // If is not an error, add the permission to the list	
        	} else {
                
        		// Create new row in permission column
        		var permission = $('#table_row_permission_template').html();
                permission = permission.replace("perm_name", result.permission.name)
                permission = permission.replace("perm_id", String(result.permission.id))
                $("#list_permissions").append(permission)

                // Add to permissions array
                application.permissions.push(result.permission)

                // Empty input from role creation form
                $("#create_permission_form").find("#id_name").val('');
                $("#create_permission_form").find('#id_description').val(''); 
                $("#create_permission_form").find('#id_action').val(''); 
                $("#create_permission_form").find('#id_resource').val(''); 
                $("#create_permission_form").find('#id_xml').val('');

                // Hide error if exist
                $("#create_permission_form").find(".help-block.alert.alert-danger").hide('close');

                // Return to normal view
                $('#backdrop').hide();
              	$('#create_permission').hide('close');

                // Add message
                var message = $('#message_template').html();
                message = message.replace(/type/g, result.message.type);
                message = message.replace(/data/g, result.message.text);
                $(".messages").replaceWith(message);
        	}	   
        });

  });
});